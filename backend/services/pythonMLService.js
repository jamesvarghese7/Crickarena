/**
 * Python ML Service Bridge
 * Executes Python ML model and communicates results back to Node.js
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PythonMLService {
  constructor() {
    this.pythonPath = 'python'; // or 'python3' on Linux/Mac
    this.scriptPath = path.join(__dirname, '../ml/lineup_ml_model.py');
    this.modelPath = path.join(__dirname, '../ml/models');
    this.tempDataPath = path.join(__dirname, '../ml/temp');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.modelPath, { recursive: true });
      await fs.mkdir(this.tempDataPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create ML directories:', error);
    }
  }

  /**
   * Execute Python script and return results
   */
  async executePython(command, playersData) {
    return new Promise(async (resolve, reject) => {
      // Write players data to temp file
      const tempFile = path.join(this.tempDataPath, `players_${Date.now()}.json`);
      
      try {
        await fs.writeFile(tempFile, JSON.stringify(playersData, null, 2));
        
        const args = [this.scriptPath, command, tempFile];
        const pythonProcess = spawn(this.pythonPath, args);
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
          // Clean up temp file
          try {
            await fs.unlink(tempFile);
          } catch (err) {
            // Ignore cleanup errors
          }
          
          if (code !== 0) {
            console.error('Python stderr:', stderr);
            reject(new Error(`Python process exited with code ${code}: ${stderr}`));
            return;
          }
          
          try {
            // Extract JSON from output (handle both arrays and objects)
            // Match last complete JSON structure (array or object)
            const jsonMatch = stdout.match(/[\[\{][\s\S]*[\]\}](?![\s\S]*[\[\{])/);
            if (!jsonMatch) {
              reject(new Error('No JSON output from Python script'));
              return;
            }
            
            const result = JSON.parse(jsonMatch[0]);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error.message}\nOutput: ${stdout}`));
          }
        });
        
        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to start Python process: ${error.message}`));
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Train the ML model with player data
   */
  async trainModel(playersData) {
    console.log(`🤖 Training ML model with ${playersData.length} players...`);
    
    try {
      const result = await this.executePython('train', playersData);
      console.log('✅ ML model trained successfully');
      return result;
    } catch (error) {
      console.error('❌ ML model training failed:', error.message);
      throw error;
    }
  }

  /**
   * Get predictions from the trained model
   */
  async predict(playersData) {
    try {
      const result = await this.executePython('predict', playersData);
      return result;
    } catch (error) {
      console.error('❌ ML prediction failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if model is trained (model file exists)
   */
  async isModelTrained() {
    try {
      const modelFile = path.join(this.modelPath, 'lineup_ml_model.pkl');
      await fs.access(modelFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format player data for ML model
   */
  formatPlayerData(players) {
    return players.map(player => ({
      _id: player._id.toString(),
      age: player.age,
      position: player.position || player.preferredPosition,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      playingExperience: player.playingExperience,
      matchesPlayed: player.statistics?.matchesPlayed || 0,
      runsScored: player.statistics?.runsScored || 0,
      wicketsTaken: player.statistics?.wicketsTaken || 0,
      catches: player.statistics?.catches || 0,
      stumpings: player.statistics?.stumpings || 0
    }));
  }

  /**
   * Get ML-enhanced player scores
   */
  async getMLPlayerScores(players) {
    const formatted = this.formatPlayerData(players);
    
    // Check if model is trained
    const isTrained = await this.isModelTrained();
    
    if (!isTrained) {
      console.log('⚠️ ML model not trained. Training now...');
      await this.trainModel(formatted);
    }
    
    // Get predictions
    const predictions = await this.predict(formatted);
    
    // Map predictions back to players
    const scoresMap = new Map();
    if (Array.isArray(predictions)) {
      predictions.forEach(pred => {
        scoresMap.set(pred.player_id, {
          mlScore: pred.predicted_score,
          confidence: pred.confidence,
          performancePred: pred.performance_pred,
          consistencyPred: pred.consistency_pred
        });
      });
    }
    
    return scoresMap;
  }
}

// Singleton instance
const mlService = new PythonMLService();

export default mlService;
