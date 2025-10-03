import { Button } from "@/components/ui/button";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { neon } from  '@neondatabase/serverless';
import { redirect } from 'next/navigation';

export default async function Home({ searchParams }: { searchParams: Promise<{ success?: string, error?: string, bd?: string, cd?: string, ld?: string, md?: string }> }) {
  const params = await searchParams;
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
    const characterid = await sql`INSERT INTO character (name, owneruserid) VALUES (${character_name}, ${userid[0].userid}) RETURNING characterid`;
    const campaignid = await sql`INSERT INTO campaign (name, title, system, ispublic) VALUES (${campaign}, ${campaign}, 'SAO RPG', true) RETURNING campaignid`;
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
        await sql`INSERT INTO dieresult (rollid, dietypeid, value) VALUES (${rollid[0].rollid}, ${dietypeMap[result.code]}, ${result.value})`;
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
  <div className="flex flex-col min-h-screen justify-center">
    <header className="sticky top-0 left-0 w-full bg-blue-500 text-white text-center p-4"></header>
    <main className="flex-1 bg-gray-800">
        {/* Success/Error Messages */}
        {params.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-auto w-2/5 mt-4">
            <strong className="font-bold">Roll Successful!</strong>
            <span className="block sm:inline"> Your dice results: </span>
            <div className="mt-2 text-lg font-bold">
              BD: {params.bd} | CD: {params.cd} | LD: {params.ld} | MD: {params.md}
            </div>
          </div>
        )}
        {params.error === 'missing_fields' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto w-2/5 mt-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> Please fill in all required fields.</span>
          </div>
        )}
        {params.error === 'database_error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto w-2/5 mt-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> Database error occurred. Please try again.</span>
          </div>
        )}
        <div className="bg-gray-300 gap-4 p-4 flex justify-center rounded my-4 mx-auto w-2/5">
            <h1 className="text-2xl font-bold">Dice Roller Project</h1>
        </div>
        
        <div className="flex bg-gray-400 flex-col justify-center p-4 rounded mx-auto w-2/5">
            <h2 className="font-bold text-xl text-center">Information Fields</h2>
            <div className="flex flex-row justify-center">
              <form action={form} >
                <div className="bg-gray-400">

                  <div className="flex flex-col justify-center w-64 p-4 gap-2">

                      <p>User Name: <span className="text-red-500">*</span></p>
                      <input type="text" name="username" placeholder="User Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" required />
                      <p>User Email (Optional):</p>
                      <input type="text" name="email" placeholder="Email Address" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Character Name: <span className="text-red-500">*</span></p>
                      <input type="text" name="character_name" placeholder="Character Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" required />
                      <p>Link to Post (Optional):</p>
                      <input type="text" name="url" placeholder="url" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Purpose of Roll: <span className="text-red-500">*</span></p>
                      <input type="text" name="purpose" placeholder="Purpose" className="border rounded p-2 bg-gray-100 placeholder-black-400" required />
                      <p>Campaign: <span className="text-red-500">*</span></p>
                      <input type="text" name="campaign" placeholder="Campaign" className="border rounded p-2 bg-gray-100 placeholder-black-400" required />
                      <p>Session Name: <span className="text-red-500">*</span></p>
                      <input type="text" name="session_name" placeholder="Session Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" required />
                  </div>
                  <div className="p-4">
                    <div>
                      <Button className="p-4" type="submit" >Roll</Button>
                      <p className="mt-4 text-sm text-gray-600">Click Roll to generate: BD (1d10) | CD (1d12) | LD (1d20) | MD (1d10)</p>
                    </div>
                  </div>
                </div>
              </form>
              <div className="bg-gray-400 p-4 w-64 flex p-4 flex-col justify-center">
                <p>Search Fields</p>
                <div className="flex flex-col gap-2">
                  <input type="text" name = "roll_id" placeholder="Roll ID" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                  <input type="text" name = "character_name" placeholder="Character Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                </div>
                <div className="p-4">
                  <Button>Search</Button>
                </div>
            </div>
          </div>
        </div>
    </main>
    <footer className="fixed bottom-0 left-0 w-full bg-blue-500 text-white text-center p-4"></footer>
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