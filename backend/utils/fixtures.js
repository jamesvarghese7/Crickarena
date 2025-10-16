// Pairing and scheduling utilities for tournament fixture generation
// Keep simple, readable algorithms with constraints hooks

export function generateRoundRobinPairings(teamIds, options = {}) {
  const ids = [...teamIds].map(String);
  const double = !!options.doubleRoundRobin;
  const list = ids.length % 2 === 0 ? ids : [...ids, '__BYE__'];
  const n = list.length;
  const rounds = n - 1;
  const half = n / 2;
  const schedule = [];

  let arr = [...list];
  for (let r = 0; r < rounds; r++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== '__BYE__' && b !== '__BYE__') {
        // Alternate home/away across rounds
        const homeFirst = (r + i) % 2 === 0;
        matches.push({ home: homeFirst ? a : b, away: homeFirst ? b : a });
      }
    }
    schedule.push({ round: r + 1, matches });
    // rotate (keep arr[0] fixed)
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }

  if (!double) return schedule;
  // Double RR: repeat with swapped home/away
  const back = schedule.map((r, idx) => ({
    round: rounds + idx + 1,
    matches: r.matches.map(m => ({ home: m.away, away: m.home }))
  }));
  return [...schedule, ...back];
}

export function splitIntoGroups(teamIds, groupCount) {
  const teams = [...teamIds].map(String);
  const groups = Array.from({ length: Math.max(1, groupCount) }, () => []);
  let i = 0;
  for (const t of teams) { groups[i % groups.length].push(t); i++; }
  return groups;
}

export function generateKnockoutBracket(teamIds) {
  const teams = [...teamIds].map(String);
  // Pad to next power of two with BYE
  const nextPow2 = 1 << Math.ceil(Math.log2(Math.max(1, teams.length)));
  const padded = [...teams];
  while (padded.length < nextPow2) padded.push('__BYE__');
  const pairs = [];
  for (let i = 0; i < padded.length; i += 2) {
    const a = padded[i], b = padded[i + 1];
    if (a !== '__BYE__' && b !== '__BYE__') {
      pairs.push({ home: a, away: b });
    }
  }
  return [{ round: 1, roundLabel: 'Round 1', stage: 'Knockout', matches: pairs }];
}

export function generateGroupsPlusKnockout(teamIds, groupCount = 2, qualifyPerGroup = 2, options = {}) {
  const groups = splitIntoGroups(teamIds, groupCount);
  const rounds = [];
  // Group RR rounds
  groups.forEach((g, idx) => {
    const rr = generateRoundRobinPairings(g, { doubleRoundRobin: !!options.doubleRoundRobin });
    rr.forEach(r => rounds.push({ round: r.round, roundLabel: `Group ${String.fromCharCode(65 + idx)} - Round ${r.round}`, stage: 'Group', matches: r.matches }));
  });
  // Knockout seeds (simple A1 vs B2, B1 vs A2 for 2 groups)
  const qualifiers = [];
  for (let gi = 0; gi < groups.length; gi++) {
    // Placeholder: will be replaced at runtime after standings. For scheduling structure, allocate slots only.
    const q = groups[gi].slice(0, qualifyPerGroup);
    qualifiers.push(q);
  }
  // basic bracket slots (IDs unknown yet); scheduler can still allocate stage/round labels later as matches completed
  return { rounds, groupsCount: groups.length, qualifyPerGroup };
}

export function estimateCapacity(startDate, endDate, venueSlots = []) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let cap = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (const v of venueSlots) cap += (Array.isArray(v.slotTimes) ? v.slotTimes.length : 0);
  }
  return cap;
}

function isoDate(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
}

export function scheduleRounds(rounds, opts) {
  const {
    startDate,
    endDate,
    venueSlots = [],
    restDaysMin = 1,
    teamBlackouts = new Map(),
    venueBlackouts = new Map(),
    respectRoundOrder = true
  } = opts || {};

  const start = new Date(startDate);
  const end = new Date(endDate);
  const lastPlayed = new Map(); // clubId -> YYYY-MM-DD

  const scheduled = [];
  const matchesFlat = [];
  rounds.forEach((r, idx) => r.matches.forEach(m => matchesFlat.push({
    ...m,
    _round: r.round || (idx + 1),
    _roundLabel: r.roundLabel,
    _stage: r.stage,
    _group: r.group
  })));

  // For strict round order, process by round buckets; else greedy
  const queue = respectRoundOrder ? null : [...matchesFlat];

  const perRoundQueues = respectRoundOrder ? rounds.map((r, idx) => [
    ...r.matches.map(m => ({
      ...m,
      _round: r.round || (idx + 1),
      _roundLabel: r.roundLabel,
      _stage: r.stage,
      _group: r.group
    }))
  ]) : [];
  let roundIndex = 0;

  // Group-aware interleaving: when multiple groups exist, alternate picks across groups
  const groupNames = Array.from(new Set((rounds || []).map(r => r.group).filter(Boolean)));
  const useGroupInterleave = respectRoundOrder && groupNames.length > 1;
  const perGroupRoundQueues = useGroupInterleave
    ? Object.fromEntries(groupNames.map(g => [g, rounds
      .filter(r => r.group === g)
      .map((r, idx) => [
        ...r.matches.map(m => ({
          ...m,
          _round: r.round || (idx + 1),
          _roundLabel: r.roundLabel,
          _stage: r.stage,
          _group: r.group
        }))
      ])]))
    : null;
  const perGroupRoundIndex = useGroupInterleave
    ? Object.fromEntries(groupNames.map(g => [g, 0]))
    : null;
  let nextGroupPick = 0;

  for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
    const dayKey = isoDate(cur);
    // Enforce: only one match per time slot across all venues on a given day
    const usedTimeslots = new Set(); // e.g., '09:00', '14:00'
    for (const v of venueSlots) {
      const name = v.name || String(v);
      const slots = Array.isArray(v.slotTimes) && v.slotTimes.length ? v.slotTimes : ['09:00'];
      for (const time of slots) {
        // If this timeslot is already occupied for this day (regardless of venue), skip
        if (usedTimeslots.has(time)) continue;
        // Skip venue blackout
        const vb = (venueBlackouts.get?.(name)) || (venueBlackouts[name]);
        if (Array.isArray(vb) && vb.includes(dayKey)) continue;

        const pickNext = () => {
          if (!respectRoundOrder) return queue.shift();
          if (useGroupInterleave) {
            // Try each group once in a round-robin fashion
            for (let tries = 0; tries < groupNames.length; tries++) {
              const g = groupNames[(nextGroupPick + tries) % groupNames.length];
              let gi = perGroupRoundIndex[g] || 0;
              const gRounds = perGroupRoundQueues[g];
              // Advance to next round for this group if current is empty
              while (gi < gRounds.length && gRounds[gi].length === 0) gi++;
              perGroupRoundIndex[g] = gi;
              if (gi >= gRounds.length) continue; // this group exhausted
              const m = gRounds[gi].shift();
              // Set next starting group for subsequent call
              nextGroupPick = (groupNames.indexOf(g) + 1) % groupNames.length;
              return m;
            }
            return undefined;
          }
          // Default strict round order (no groups to interleave)
          while (roundIndex < perRoundQueues.length) {
            const q = perRoundQueues[roundIndex];
            if (q.length) return q.shift();
            roundIndex += 1;
          }
          return undefined;
        };

        let match = pickNext();
        if (!match) continue;

        // Team constraints
        const tbHome = (teamBlackouts.get?.(match.home)) || (teamBlackouts[match.home]);
        const tbAway = (teamBlackouts.get?.(match.away)) || (teamBlackouts[match.away]);
        if ((Array.isArray(tbHome) && tbHome.includes(dayKey)) || (Array.isArray(tbAway) && tbAway.includes(dayKey))) {
          // Put back and try next slot
          if (!respectRoundOrder) queue.push(match);
          else if (useGroupInterleave) {
            // Return to the head of the same group's current round
            const g = match._group;
            if (g && perGroupRoundQueues?.[g]) {
              const gi = perGroupRoundIndex[g] || 0;
              perGroupRoundQueues[g][gi]?.unshift(match);
            } else {
              // Fallback
              perRoundQueues[roundIndex]?.unshift(match);
            }
          } else {
            perRoundQueues[roundIndex].push(match);
          }
          continue;
        }

        const lastH = lastPlayed.get(match.home);
        const lastA = lastPlayed.get(match.away);
        const daysSince = (prev) => {
          if (!prev) return Infinity;
          const prevDate = new Date(prev);
          const diff = (cur - prevDate) / (24 * 60 * 60 * 1000);
          return diff;
        };
        if (daysSince(lastH) < restDaysMin || daysSince(lastA) < restDaysMin) {
          if (!respectRoundOrder) queue.push(match);
          else perRoundQueues[roundIndex].push(match);
          continue;
        }

        // Assign
        scheduled.push({
          home: match.home,
          away: match.away,
          date: new Date(cur),
          time,
          venue: name,
          round: match._roundLabel || `Round ${match._round}`,
          stage: match._stage || 'Group',
          group: match._group || ''
        });
        // Mark this time as used for the day to prevent any other match at the same time
        usedTimeslots.add(time);
        lastPlayed.set(match.home, dayKey);
        lastPlayed.set(match.away, dayKey);
      }
    }
  }

  // Verify all scheduled
  const total = matchesFlat.length;
  if (scheduled.length < total) {
    const msg = `Scheduled ${scheduled.length}/${total} matches. Insufficient capacity or constraints too strict.`;
    const days = Math.ceil((end - start) / (24*60*60*1000)) + 1;
    const cap = days * venueSlots.reduce((s, v) => s + (Array.isArray(v.slotTimes) ? v.slotTimes.length : 0), 0);
    return { ok: false, message: msg, capacity: cap, required: total, scheduled };
  }

  return { ok: true, matches: scheduled };
}


