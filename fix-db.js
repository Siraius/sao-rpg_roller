const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔧 Fixing database relationships...\n');
    
    // Fix character-campaign relationships
    // Update each character to be associated with the corresponding campaign
    const characters = await sql`SELECT characterid, owneruserid FROM character WHERE campaignid IS NULL`;
    console.log('Characters needing campaign assignment:', characters.length);
    
    for (const char of characters) {
      // Find the campaign created by the same user
      const campaign = await sql`SELECT c.campaignid FROM campaign c 
        JOIN session s ON c.campaignid = s.campaignid 
        JOIN roll r ON s.sessionid = r.sessionid 
        WHERE r.characterid = ${char.characterid}
        LIMIT 1`;
      
      if (campaign.length > 0) {
        await sql`UPDATE character SET campaignid = ${campaign[0].campaignid} WHERE characterid = ${char.characterid}`;
        console.log(`✓ Updated character ${char.characterid} to campaign ${campaign[0].campaignid}`);
      }
    }
    
    // Fix die result rollid format (remove padding spaces)
    console.log('\n🎯 Fixing die result rollid formatting...');
    await sql`UPDATE dieresult SET rollid = TRIM(rollid::text)::INTEGER WHERE rollid::text != TRIM(rollid::text)`;
    console.log('✓ Fixed rollid formatting in dieresult table');
    
    // Test the query again
    console.log('\n🔄 Testing query after fixes:');
    const rollsQuery = await sql`
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
    console.log('Fixed query result count:', rollsQuery.length);
    console.log('Sample result:', rollsQuery[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDatabase();