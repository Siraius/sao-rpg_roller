const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function debugDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Debugging database contents...\n');
    
    // Check all tables exist
    console.log('📋 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables found:', tables.map(t => t.table_name));
    
    // Check users
    console.log('\n👥 Users:');
    const users = await sql`SELECT * FROM app_user ORDER BY userid`;
    console.log(users);
    
    // Check characters
    console.log('\n🎭 Characters:');
    const characters = await sql`SELECT * FROM character ORDER BY characterid`;
    console.log(characters);
    
    // Check campaigns
    console.log('\n🏰 Campaigns:');
    const campaigns = await sql`SELECT * FROM campaign ORDER BY campaignid`;
    console.log(campaigns);
    
    // Check sessions
    console.log('\n🎮 Sessions:');
    const sessions = await sql`SELECT * FROM session ORDER BY sessionid`;
    console.log(sessions);
    
    // Check rolls
    console.log('\n🎲 Rolls:');
    const rolls = await sql`SELECT * FROM roll ORDER BY rollid`;
    console.log(rolls);
    
    // Check die results
    console.log('\n🎯 Die Results:');
    const dieResults = await sql`SELECT * FROM dieresult ORDER BY rollid`;
    console.log(dieResults);
    
    // Check die types
    console.log('\n🎲 Die Types:');
    const dieTypes = await sql`SELECT * FROM dietype ORDER BY dietypeid`;
    console.log(dieTypes);
    
    // Try the complex query from the app
    console.log('\n🔄 Testing complex query from app:');
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
    console.log('Complex query result:', rollsQuery);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDatabase();