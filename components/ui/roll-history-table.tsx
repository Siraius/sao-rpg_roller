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
      <div className="bg-gray-300 rounded p-4 text-center">
        <p className="text-gray-600">No rolls recorded yet. Roll some dice to see them here!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 rounded p-4">
      <h2 className="font-bold text-xl mb-4 text-center">Roll History</h2>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse border border-gray-400 bg-white rounded min-w-max">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">Roll ID</th>
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">User</th>
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">Character</th>
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">Campaign</th>
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">Purpose</th>
              <th className="border border-gray-400 px-2 py-2 text-center text-sm font-semibold">BD<br/><span className="text-xs font-normal">(1d10)</span></th>
              <th className="border border-gray-400 px-2 py-2 text-center text-sm font-semibold">CD<br/><span className="text-xs font-normal">(1d12)</span></th>
              <th className="border border-gray-400 px-2 py-2 text-center text-sm font-semibold">LD<br/><span className="text-xs font-normal">(1d20)</span></th>
              <th className="border border-gray-400 px-2 py-2 text-center text-sm font-semibold">MD<br/><span className="text-xs font-normal">(1d10)</span></th>
              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {rolls.map((roll) => (
              <tr key={roll.rollid} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-400 px-2 py-2 font-mono text-sm">
                  <span className="bg-gray-100 px-1 rounded text-xs">#{roll.rollid}</span>
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  <div>
                    <div className="font-semibold text-sm">{roll.username}</div>
                    {roll.email && (
                      <div className="text-xs text-gray-600 truncate max-w-24">{roll.email}</div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-sm">
                  <span className="font-medium">{roll.character_name}</span>
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  <div>
                    <div className="font-semibold text-sm">{roll.campaign_name}</div>
                    <div className="text-xs text-gray-600">{roll.session_title}</div>
                  </div>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-sm max-w-32">
                  <div>
                    <div className="truncate">{roll.purpose}</div>
                    {roll.url && (
                      <div className="text-xs mt-1">
                        <a 
                          href={roll.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          🔗 <span className="ml-1">Link</span>
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-lg min-w-8">
                    {roll.dice_results.BD}
                  </span>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded font-bold text-lg min-w-8">
                    {roll.dice_results.CD}
                  </span>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-center">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold text-lg min-w-8">
                    {roll.dice_results.LD}
                  </span>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-center">
                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold text-lg min-w-8">
                    {roll.dice_results.MD}
                  </span>
                </td>
                <td className="border border-gray-400 px-2 py-2 text-xs text-gray-600 min-w-32">
                  <div>{new Date(roll.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(roll.timestamp).toLocaleTimeString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">
        <span className="font-semibold">Legend:</span> 
        <span className="ml-2">BD (Basic Dice 1d10)</span>
        <span className="ml-2">CD (Combo Dice 1d12)</span>
        <span className="ml-2">LD (Lucky Dice 1d20)</span>
        <span className="ml-2">MD (Modifier Dice 1d10)</span>
      </div>
    </div>
  );
}