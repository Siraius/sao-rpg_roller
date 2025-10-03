import { Button } from "@/components/ui/button";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { neon } from  '@neondatabase/serverless';

export default function Home() {

  // Temporary placeholder values for dice rolls
  const BDRoll = 0;
  const CDRoll = 0;
  const LDRoll = 0;
  const MDRoll = 0;

  async function form(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const username = formData.get('username');
    const email = formData.get('email');
    const character_name = formData.get('character_name');
    const url = formData.get('url');
    const purpose = formData.get('purpose');
    const campaign = formData.get('campaign');
    const session_name = formData.get('session_name');

    // Insert the comment from the form into the Postgres database
    
    const userid = await sql`INSERT INTO app_user (name, email) VALUES (${username}, ${email}) RETURNING userid`;
    const characterid = await sql`INSERT INTO character (character_name, user_id) VALUES (${character_name}, ${userid[0].userid}) RETURNING characterid`;
    const campaignid = await sql`INSERT INTO campaign (campaign_name, user_id) VALUES (${campaign}, ${userid[0].userid}) RETURNING campaignid`;
    const sessionid = await sql`INSERT INTO session (title, campaign_id) VALUES (${session_name}, ${campaignid[0].campaignid}) RETURNING sessionid`;
    const rollid = await sql`INSERT INTO roll (url, purpose, campaign, session_id, character_id) VALUES (${url}, ${purpose}, ${campaignid[0].campaignid}, ${sessionid[0].sessionid}, ${characterid[0].characterid}) RETURNING rollid`;
    console.log("User ID: ", userid[0].userid);
    console.log("Character ID: ", characterid[0].characterid);
    console.log("Roll ID: ", rollid[0].rollid);
  }

 return (
  <div className="flex flex-col min-h-screen justify-center">
    <header className="sticky top-0 left-0 w-full bg-blue-500 text-white text-center p-4"></header>
    <main className="flex-1 bg-gray-800">
        <div className="bg-gray-300 gap-4 p-4 flex justify-center rounded my-4 mx-auto w-2/5">
            <h1 className="text-2xl font-bold">Dice Roller Project</h1>
        </div>
        
        <div className="flex bg-gray-400 flex-col justify-center p-4 rounded mx-auto w-2/5">
            <h2 className="font-bold text-xl text-center">Information Fields</h2>
            <div className="flex flex-row justify-center">
              <form action={form} >
                <div className="bg-gray-400">

                  <div className="flex flex-col justify-center w-64 p-4 gap-2">

                      <p>User Name:</p>
                      <input type="text" name="username" placeholder="User Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>User Email (Optional):</p>
                      <input type="text" name="email" placeholder="Email Address" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Character Name:</p>
                      <input type="text" name="character_name" placeholder="Character Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Link to Post (Optional):</p>
                      <input type="text" name="url" placeholder="url" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Purpose of Roll:</p>
                      <input type="text" name="purpose" placeholder="Purpose" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Campaign:</p>
                      <input type="text" name="campaign" placeholder="Campaign" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                      <p>Session Number:</p>
                      <input type="text" name = "session_name"placeholder="Session Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                  </div>
                  <div className="p-4">
                    {/* <RollButton/> */}
                    <div>
                      <Button className="p-4" type="submit" >Roll</Button>
                      <p className="mt-4">BD {BDRoll} | CD {CDRoll} | LD {LDRoll} | MD {MDRoll} </p>
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