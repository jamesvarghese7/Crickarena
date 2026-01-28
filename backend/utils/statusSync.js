import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';

function parseDateTime(date, time) {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (!time) return d;
    const [hh, mm] = String(time).split(':').map(Number);
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      d.setHours(hh, mm, 0, 0);
    }
    return d;
  } catch (_) {
    return null;
  }
}

export async function syncTournamentAndMatches(now = new Date()) {
  const updates = { tournaments: 0, matches: 0 };

  // 1) Promote Scheduled -> Live when start time reached
  const schedToLive = await Match.find({ status: 'Scheduled', date: { $ne: null } }).select('_id date time tournament status');
  const liveIds = [];
  for (const m of schedToLive) {
    const dt = parseDateTime(m.date, m.time || '09:00');
    if (dt && now >= dt) liveIds.push(m._id);
  }
  if (liveIds.length) {
    await Match.updateMany({ _id: { $in: liveIds } }, { $set: { status: 'Live' } });
    updates.matches += liveIds.length;
    // Ensure parent tournaments become ongoing
    const affected = await Match.find({ _id: { $in: liveIds } }).distinct('tournament');
    if (affected.length) {
      await Tournament.updateMany({ _id: { $in: affected }, status: { $in: ['open', 'upcoming'] } }, { $set: { status: 'ongoing' } });
    }
  }

  // 2) Mark tournaments completed when all matches completed and endDate passed
  // For multi-stage formats, only mark complete if knockout matches exist
  const activeTs = await Tournament.find({ status: { $in: ['upcoming', 'ongoing'] } }).select('_id status startDate endDate fixturesGenerated format');
  for (const t of activeTs) {
    const total = await Match.countDocuments({ tournament: t._id });
    const completed = await Match.countDocuments({ tournament: t._id, status: 'Completed' });
    const endOk = t.endDate ? now >= new Date(t.endDate) : false;

    // Check for multi-stage formats that require knockout matches to be completed
    const isMultiStageFormat = ['league+playoff', 'groups+knockouts', 'super-league', 'groups+super8'].includes(t.format);

    if (total > 0 && completed === total && t.status !== 'completed') {
      if (isMultiStageFormat) {
        // For multi-stage formats, only complete if knockout matches exist
        const knockoutMatches = await Match.countDocuments({ tournament: t._id, stage: 'Knockout' });
        if (knockoutMatches > 0) {
          await Tournament.updateOne({ _id: t._id }, { $set: { status: 'completed' } });
          updates.tournaments += 1;
        }
        // If no knockout matches, don't mark as completed - waiting for knockout seeding
      } else {
        // Simple formats (league, knockout, round-robin) - complete when all done
        await Tournament.updateOne({ _id: t._id }, { $set: { status: 'completed' } });
        updates.tournaments += 1;
      }
      continue;
    }
    // 3) If fixtures generated and startDate reached, ensure status at least 'ongoing'
    const startOk = t.startDate ? now >= new Date(t.startDate) : false;
    if (t.fixturesGenerated && startOk && t.status === 'upcoming') {
      await Tournament.updateOne({ _id: t._id }, { $set: { status: 'ongoing' } });
      updates.tournaments += 1;
      continue;
    }
    // 4) If registrationDeadline passed and still 'open', move to 'upcoming'
    if (t.status === 'open') {
      const full = await Tournament.findById(t._id).select('registrationDeadline').lean();
      if (full?.registrationDeadline && now >= new Date(full.registrationDeadline)) {
        await Tournament.updateOne({ _id: t._id }, { $set: { status: 'upcoming' } });
        updates.tournaments += 1;
      }
    }
  }

  return updates;
}





