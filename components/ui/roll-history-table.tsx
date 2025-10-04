import React from 'react';

interface DiceRoll {
  rollid: number;
  userid: number;
  username: string;
  email?: string;
  character_name: string;
  campaign_name: string;
  session_title: string;
  purpose: string;
  url?: string;
  timestamp: string;
  dice_results: {
    BD: number;
    CD: number;
    LD: number;
    MD: number;
  };
}

interface RollHistoryTableProps {
  rolls: DiceRoll[];
}

export default function RollHistoryTable({ rolls }: RollHistoryTableProps) {
  if (rolls.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/30 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-4">🎲</div>
        <h3 className="text-xl font-bold text-white mb-2">No rolls yet!</h3>
        <p className="text-gray-300">Roll some dice to start building your adventure history</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-indigo-900/40 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <span className="text-3xl">📜</span>
        <h2 className="text-2xl font-bold text-white">Adventure History</h2>
        <span className="text-3xl">🎲</span>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-4">
        {rolls.map((roll) => (
          <div key={roll.rollid} className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs font-mono">
                    #{roll.rollid}
                  </span>
                  <span className="text-white font-semibold">{roll.username}</span>
                </div>
                <div className="text-sm text-gray-300">{roll.character_name}</div>
                <div className="text-xs text-gray-400">
                  {roll.campaign_name} • {roll.session_title}
                </div>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <div>{new Date(roll.timestamp).toLocaleDateString()}</div>
                <div>{new Date(roll.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-300 mb-1">Purpose:</div>
              <div className="text-white text-sm">{roll.purpose}</div>
              {roll.url && (
                <a 
                  href={roll.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-flex items-center"
                >
                  🔗 <span className="ml-1">View Post</span>
                </a>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2 text-center">
                <div className="text-xs text-blue-300 mb-1">BD</div>
                <div className="text-lg font-bold text-blue-100">{roll.dice_results.BD}</div>
              </div>
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-2 text-center">
                <div className="text-xs text-green-300 mb-1">CD</div>
                <div className="text-lg font-bold text-green-100">{roll.dice_results.CD}</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 text-center">
                <div className="text-xs text-yellow-300 mb-1">LD</div>
                <div className="text-lg font-bold text-yellow-100">{roll.dice_results.LD}</div>
              </div>
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-2 text-center">
                <div className="text-xs text-purple-300 mb-1">MD</div>
                <div className="text-lg font-bold text-purple-100">{roll.dice_results.MD}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="bg-slate-900/50 rounded-xl border border-slate-600/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-indigo-900 border-b border-slate-600/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Roll</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Player</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Character</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Purpose</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-300">BD<br/><span className="text-xs font-normal">(1d10)</span></th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-green-300">CD<br/><span className="text-xs font-normal">(1d12)</span></th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-300">LD<br/><span className="text-xs font-normal">(1d20)</span></th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-purple-300">MD<br/><span className="text-xs font-normal">(1d10)</span></th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {rolls.map((roll, index) => (
                <tr key={roll.rollid} className={`hover:bg-slate-800/50 transition-colors border-b border-slate-700/30 ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'}`}>
                  <td className="px-4 py-3">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs font-mono">
                      #{roll.rollid}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-sm text-white">{roll.username}</div>
                      {roll.email && (
                        <div className="text-xs text-gray-400 truncate max-w-32">{roll.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-white text-sm">{roll.character_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-sm text-white">{roll.campaign_name}</div>
                      <div className="text-xs text-gray-400">{roll.session_title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-48">
                      <div className="text-white text-sm truncate">{roll.purpose}</div>
                      {roll.url && (
                        <div className="text-xs mt-1">
                          <a 
                            href={roll.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                          >
                            🔗 <span className="ml-1">Link</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-blue-500/20 text-blue-100 border border-blue-400/30 px-3 py-2 rounded-lg font-bold text-lg min-w-12">
                      {roll.dice_results.BD}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-green-500/20 text-green-100 border border-green-400/30 px-3 py-2 rounded-lg font-bold text-lg min-w-12">
                      {roll.dice_results.CD}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-yellow-500/20 text-yellow-100 border border-yellow-400/30 px-3 py-2 rounded-lg font-bold text-lg min-w-12">
                      {roll.dice_results.LD}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-purple-500/20 text-purple-100 border border-purple-400/30 px-3 py-2 rounded-lg font-bold text-lg min-w-12">
                      {roll.dice_results.MD}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 min-w-28">
                    <div>{new Date(roll.timestamp).toLocaleDateString()}</div>
                    <div>{new Date(roll.timestamp).toLocaleTimeString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600/50">
        <p className="text-sm text-gray-300 mb-2 font-semibold text-center">Dice Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-blue-300">BD - Basic Dice (1d10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-green-300">CD - Combo Dice (1d12)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-yellow-300">LD - Lucky Dice (1d20)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-purple-300">MD - Modifier Dice (1d10)</span>
          </div>
        </div>
      </div>
    </div>
  );
}