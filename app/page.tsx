import { Button } from "@/components/ui/button";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { neon } from  '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import RollHistoryTable from "@/components/ui/roll-history-table";

// Function to fetch roll history from database
async function getRollHistory(rollId?: string, characterName?: string) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    let rollsQuery;
    
    // Handle different search scenarios
    if (rollId && rollId.trim() !== '') {
      // Search by Roll ID (exact match)
      const parsedRollId = parseInt(rollId);
      if (characterName && characterName.trim() !== '') {
        // Both Roll ID and Character Name
        rollsQuery = await sql`
          SELECT 
            r.rollid,
            r.userid,
            u.name as username,
            u.email,
            c.name as character_name,
            camp.name as campaign_name,
            s.title as session_title,
            r.purposeid as purpose,
            p.url,
            r.ts as timestamp
          FROM roll r
          JOIN app_user u ON r.userid = u.userid
          JOIN character c ON r.characterid = c.characterid  
          JOIN campaign camp ON c.campaignid = camp.campaignid
          JOIN session s ON r.sessionid = s.sessionid
          LEFT JOIN post p ON r.postid = p.postid
          WHERE r.rollid = ${parsedRollId} AND LOWER(c.name) LIKE LOWER(${`%${characterName}%`})
          ORDER BY r.ts DESC
          LIMIT 50
        `;
      } else {
        // Only Roll ID
        rollsQuery = await sql`
          SELECT 
            r.rollid,
            r.userid,
            u.name as username,
            u.email,
            c.name as character_name,
            camp.name as campaign_name,
            s.title as session_title,
            r.purposeid as purpose,
            p.url,
            r.ts as timestamp
          FROM roll r
          JOIN app_user u ON r.userid = u.userid
          JOIN character c ON r.characterid = c.characterid  
          JOIN campaign camp ON c.campaignid = camp.campaignid
          JOIN session s ON r.sessionid = s.sessionid
          LEFT JOIN post p ON r.postid = p.postid
          WHERE r.rollid = ${parsedRollId}
          ORDER BY r.ts DESC
          LIMIT 50
        `;
      }
    } else if (characterName && characterName.trim() !== '') {
      // Search by Character Name only
      rollsQuery = await sql`
        SELECT 
          r.rollid,
          r.userid,
          u.name as username,
          u.email,
          c.name as character_name,
          camp.name as campaign_name,
          s.title as session_title,
          r.purposeid as purpose,
          p.url,
          r.ts as timestamp
        FROM roll r
        JOIN app_user u ON r.userid = u.userid
        JOIN character c ON r.characterid = c.characterid  
        JOIN campaign camp ON c.campaignid = camp.campaignid
        JOIN session s ON r.sessionid = s.sessionid
        LEFT JOIN post p ON r.postid = p.postid
        WHERE LOWER(c.name) LIKE LOWER(${`%${characterName}%`})
        ORDER BY r.ts DESC
        LIMIT 50
      `;
    } else {
      // No search parameters - get all recent rolls
      rollsQuery = await sql`
        SELECT 
          r.rollid,
          r.userid,
          u.name as username,
          u.email,
          c.name as character_name,
          camp.name as campaign_name,
          s.title as session_title,
          r.purposeid as purpose,
          p.url,
          r.ts as timestamp
        FROM roll r
        JOIN app_user u ON r.userid = u.userid
        JOIN character c ON r.characterid = c.characterid  
        JOIN campaign camp ON c.campaignid = camp.campaignid
        JOIN session s ON r.sessionid = s.sessionid
        LEFT JOIN post p ON r.postid = p.postid
        ORDER BY r.ts DESC
        LIMIT 20
      `;
    }
    
    // Get dice results for each roll
    const rollsWithDice = await Promise.all(
      rollsQuery.map(async (roll) => {
        const diceResults = await sql`
          SELECT dt.code, dr.value
          FROM dieresult dr
          JOIN dietype dt ON dr.dietypeid = dt.dietypeid
          WHERE dr.rollid = ${roll.rollid}
        `;
        
        const dice_results = {
          BD: diceResults.find(d => d.code === 'BD')?.value || 0,
          CD: diceResults.find(d => d.code === 'CD')?.value || 0,
          LD: diceResults.find(d => d.code === 'LD')?.value || 0,
          MD: diceResults.find(d => d.code === 'MD')?.value || 0,
        };
        
        return {
          rollid: roll.rollid,
          userid: roll.userid,
          username: roll.username,
          email: roll.email || undefined,
          character_name: roll.character_name,
          campaign_name: roll.campaign_name,
          session_title: roll.session_title,
          purpose: roll.purpose,
          url: roll.url || undefined,
          timestamp: roll.timestamp,
          dice_results
        };
      })
    );
    
    return rollsWithDice;
  } catch (error) {
    console.error('Error fetching roll history:', error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ 
  success?: string, 
  error?: string, 
  bd?: string, 
  cd?: string, 
  ld?: string, 
  md?: string,
  roll_id?: string,
  character_name?: string,
  search_performed?: string,
  no_results?: string
}> }) {
  const params = await searchParams;
  const rollHistory = await getRollHistory(params.roll_id, params.character_name);
  
  async function searchForm(formData: FormData) {
    'use server';
    const rollId = formData.get('roll_id') as string;
    const characterName = formData.get('character_name') as string;
    
    // Build search URL parameters
    const searchParamsArray = [];
    if (rollId && rollId.trim() !== '') {
      searchParamsArray.push(`roll_id=${encodeURIComponent(rollId.trim())}`);
    }
    if (characterName && characterName.trim() !== '') {
      searchParamsArray.push(`character_name=${encodeURIComponent(characterName.trim())}`);
    }
    
    // Add search performed flag
    searchParamsArray.push('search_performed=true');
    
    const searchQuery = searchParamsArray.length > 0 ? '?' + searchParamsArray.join('&') : '?search_performed=true';
    redirect(searchQuery);
  }
  
  async function clearSearch() {
    'use server';
    redirect('/');
  }
  
  async function form(formData: FormData) {
    'use server';
    try {
      // Connect to the Neon database
      const sql = neon(`${process.env.DATABASE_URL}`);
      const username = formData.get('username');
      const email = formData.get('email');
      const character_name = formData.get('character_name');
      const url = formData.get('url');
      const purpose = formData.get('purpose');
      const campaign = formData.get('campaign');
      const session_name = formData.get('session_name');
      
      // Validate required fields
      if (!username || !character_name || !purpose || !campaign || !session_name) {
        redirect('/?error=missing_fields');
        return;
      }

    // Perform dice rolls
    const BDRoll = new DiceRoll("1d10");
    const CDRoll = new DiceRoll("1d12");
    const LDRoll = new DiceRoll("1d20");
    const MDRoll = new DiceRoll("1d10");

    console.log(`Dice Rolls - BD: ${BDRoll.total}, CD: ${CDRoll.total}, LD: ${LDRoll.total}, MD: ${MDRoll.total}`);

    // Insert records into the database
    const userid = await sql`INSERT INTO app_user (name, email) VALUES (${username}, ${email}) RETURNING userid`;
    const campaignid = await sql`INSERT INTO campaign (name, title, system, ispublic) VALUES (${campaign}, ${campaign}, 'SAO RPG', true) RETURNING campaignid`;
    const characterid = await sql`INSERT INTO character (name, owneruserid, campaignid) VALUES (${character_name}, ${userid[0].userid}, ${campaignid[0].campaignid}) RETURNING characterid`;
    const sessionid = await sql`INSERT INTO session (title, campaignid, starttime) VALUES (${session_name}, ${campaignid[0].campaignid}, NOW()) RETURNING sessionid`;
    
    // Insert post record if URL is provided
    let postid = null;
    if (url && url.toString().trim() !== '') {
      const postResult = await sql`INSERT INTO post (url, description) VALUES (${url}, ${purpose}) RETURNING postid`;
      postid = postResult[0].postid;
    }
    
    // Insert the main roll record
    const rollid = await sql`INSERT INTO roll (userid, purposeid, sessionid, characterid, postid, ts) VALUES (${userid[0].userid}, ${purpose}, ${sessionid[0].sessionid}, ${characterid[0].characterid}, ${postid}, NOW()) RETURNING rollid`;
    
    // Ensure die types exist in the database, create if they don't
    const dieTypeDefinitions = [
      { code: 'BD', name: 'Basic Dice', sides: 10 },
      { code: 'CD', name: 'Combo Dice', sides: 12 },
      { code: 'LD', name: 'Lucky Dice', sides: 20 },
      { code: 'MD', name: 'Modifier Dice', sides: 10 }
    ];
    
    // Insert die types if they don't exist (using ON CONFLICT to avoid duplicates)
    for (const dieType of dieTypeDefinitions) {
      await sql`
        INSERT INTO dietype (code, name, sides) 
        VALUES (${dieType.code}, ${dieType.name}, ${dieType.sides}) 
        ON CONFLICT (code) DO NOTHING
      `;
    }
    
    // Get die type IDs
    const dietypes = await sql`SELECT dietypeid, code FROM dietype WHERE code IN ('BD', 'CD', 'LD', 'MD')`;
    const dietypeMap = Object.fromEntries(dietypes.map(dt => [dt.code, dt.dietypeid]));
    
    // Insert individual die results
    const diceResults = [
      { code: 'BD', value: BDRoll.total },
      { code: 'CD', value: CDRoll.total },
      { code: 'LD', value: LDRoll.total },
      { code: 'MD', value: MDRoll.total }
    ];
    
    for (const result of diceResults) {
      if (dietypeMap[result.code]) {
        await sql`INSERT INTO dieresult (rollid, dietypeid, value) VALUES (${rollid[0].rollid}::INTEGER, ${dietypeMap[result.code]}, ${result.value})`;
      }
    }
    
      console.log("User ID: ", userid[0].userid);
      console.log("Character ID: ", characterid[0].characterid);
      console.log("Roll ID: ", rollid[0].rollid);
      console.log("Dice Results stored successfully");
      
      // Redirect to show success with dice roll results
      redirect(`/?success=true&bd=${BDRoll.total}&cd=${CDRoll.total}&ld=${LDRoll.total}&md=${MDRoll.total}`);
    } catch (error) {
      // Check if this is a Next.js redirect (which is expected)
      if (error instanceof Error && error.message && error.message.includes('NEXT_REDIRECT')) {
        throw error; // Re-throw redirect errors
      }
      console.error('Error processing form:', error);
      redirect('/?error=database_error');
    }
  }

 return (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
    <header className="sticky top-0 left-0 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 backdrop-blur-md bg-opacity-95 text-white shadow-lg border-b border-purple-500/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="text-3xl">⚔️</div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SAO RPG Dice Roller
          </h1>
          <div className="text-3xl">🎲</div>
        </div>
      </div>
    </header>
    <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {params.success && (
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md border border-emerald-400/50 text-emerald-100 px-6 py-4 rounded-xl mx-auto max-w-2xl mt-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <strong className="font-bold text-lg">Roll Successful!</strong>
            </div>
            <p className="mt-2 text-emerald-200">Your dice results:</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-500/30 backdrop-blur-sm border border-blue-400/50 rounded-lg p-3 text-center">
                <div className="text-xs text-blue-200 mb-1">BD (1d10)</div>
                <div className="text-2xl font-bold text-blue-100">{params.bd}</div>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm border border-green-400/50 rounded-lg p-3 text-center">
                <div className="text-xs text-green-200 mb-1">CD (1d12)</div>
                <div className="text-2xl font-bold text-green-100">{params.cd}</div>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-3 text-center">
                <div className="text-xs text-yellow-200 mb-1">LD (1d20)</div>
                <div className="text-2xl font-bold text-yellow-100">{params.ld}</div>
              </div>
              <div className="bg-purple-500/30 backdrop-blur-sm border border-purple-400/50 rounded-lg p-3 text-center">
                <div className="text-xs text-purple-200 mb-1">MD (1d10)</div>
                <div className="text-2xl font-bold text-purple-100">{params.md}</div>
              </div>
            </div>
          </div>
        )}
        {params.error === 'missing_fields' && (
          <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-md border border-red-400/50 text-red-100 px-6 py-4 rounded-xl mx-auto max-w-2xl mt-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <strong className="font-bold text-lg">Error</strong>
            </div>
            <p className="mt-2 text-red-200">Please fill in all required fields.</p>
          </div>
        )}
        {params.error === 'database_error' && (
          <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-md border border-red-400/50 text-red-100 px-6 py-4 rounded-xl mx-auto max-w-2xl mt-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💥</span>
              <strong className="font-bold text-lg">Database Error</strong>
            </div>
            <p className="mt-2 text-red-200">An error occurred. Please try again.</p>
          </div>
        )}
        
        {/* Search Results Messages */}
        {params.search_performed && (
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-400/50 text-blue-100 px-6 py-4 rounded-xl mx-auto max-w-2xl mt-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔍</span>
              <strong className="font-bold text-lg">Search Results</strong>
            </div>
            <p className="mt-2 text-blue-200">
              {rollHistory.length === 0 ? (
                <span>⚠️ No rolls found matching your search criteria. Try different search terms.</span>
              ) : (
                <span>✓ Found {rollHistory.length} roll{rollHistory.length !== 1 ? 's' : ''} matching your search.</span>
              )}
            </p>
            {(params.roll_id || params.character_name) && (
              <div className="mt-2 text-sm text-blue-300">
                <strong>Search terms:</strong>
                {params.roll_id && <span className="ml-2 bg-blue-500/30 px-2 py-1 rounded">Roll ID: {params.roll_id}</span>}
                {params.character_name && <span className="ml-2 bg-blue-500/30 px-2 py-1 rounded">Character: {params.character_name}</span>}
              </div>
            )}
          </div>
        )}
        
        <div className="text-center mb-8 mt-8">
            <h2 className="text-xl text-gray-300 mb-2">Ready to test your luck in Aincrad?</h2>
            <p className="text-gray-400 text-sm">Roll your dice and see what fate awaits your character</p>
        </div>
        
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Roll Form */}
              <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover-glow animate-slide-up">
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-2xl animate-dice-roll">🎲</span>
                  <h2 className="text-2xl font-bold text-white">Roll Dice</h2>
                </div>
                
                <form action={form} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-200">
                        User Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="username" 
                        placeholder="Enter your username" 
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-200">
                        Email Address <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="your@email.com" 
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-200">
                        Character Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="character_name" 
                        placeholder="Your character's name" 
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-200">
                        Campaign <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="campaign" 
                        placeholder="Campaign name" 
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Session Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="session_name" 
                      placeholder="Current session name" 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Purpose of Roll <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="purpose" 
                      placeholder="What are you rolling for?" 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Post URL <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input 
                      type="url" 
                      name="url" 
                      placeholder="https://..." 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all" 
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-purple-500/30">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
                      size="lg"
                    >
                      <span className="text-xl mr-2">🎲</span>
                      Roll Dice
                    </Button>
                    <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600/50">
                      <p className="text-sm text-gray-300 text-center">
                        <span className="font-semibold">Dice Types:</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                        <span className="text-blue-300">BD (1d10)</span>
                        <span className="text-green-300">CD (1d12)</span>
                        <span className="text-yellow-300">LD (1d20)</span>
                        <span className="text-purple-300">MD (1d10)</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Search Panel */}
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 shadow-2xl hover-glow animate-slide-up">
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-2xl">🔍</span>
                  <h2 className="text-2xl font-bold text-white">Search Rolls</h2>
                </div>
                
                <form action={searchForm} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Roll ID
                    </label>
                    <input 
                      type="text" 
                      name="roll_id" 
                      placeholder="Enter Roll ID" 
                      defaultValue={params.roll_id || ''}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Character Name
                    </label>
                    <input 
                      type="text" 
                      name="character_name" 
                      placeholder="Search by character" 
                      defaultValue={params.character_name || ''}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
                    >
                      <span className="text-lg mr-2">🔍</span>
                      Search
                    </Button>
                    
                    {params.search_performed && (
                      <form action={clearSearch}>
                        <Button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200"
                        >
                          ✖️ Clear Search
                        </Button>
                      </form>
                    )}
                  </div>
                </form>
                  
                  <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600/50">
                    <p className="text-sm text-gray-300 mb-2 font-semibold">💡 Search Tips:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• <strong>Roll ID:</strong> Enter specific roll number for exact match</li>
                      <li>• <strong>Character:</strong> Partial names work (case-insensitive)</li>
                      <li>• <strong>Combined:</strong> Use both fields to narrow results</li>
                      <li>• <strong>Clear:</strong> Leave both empty to see all recent rolls</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        {/* Roll History Table */}
        <div className="mt-8 mx-auto w-full max-w-7xl px-4 animate-fade-in">
          <RollHistoryTable rolls={rollHistory} />
        </div>
    </main>
    <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-purple-500/30 text-white mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">SAO RPG Dice Roller © 2024</p>
            <p className="text-xs text-gray-400">May your rolls be ever in your favor</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Built with Next.js</span>
            <span>•</span>
            <span>Powered by Neon DB</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
 );
}


/*

// File: app/page.tsx
import { neon } from '@neondatabase/serverless';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}

*/