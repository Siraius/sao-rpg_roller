const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');
    const sql = neon(process.env.DATABASE_URL);

    // Read the SQL file
    const sqlScript = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    
    // Split the SQL script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement individually
    // Drop tables first
    const dropStatements = [
      'DROP TABLE IF EXISTS dieresult CASCADE',
      'DROP TABLE IF EXISTS dietype CASCADE', 
      'DROP TABLE IF EXISTS roll CASCADE',
      'DROP TABLE IF EXISTS post CASCADE',
      'DROP TABLE IF EXISTS session CASCADE',
      'DROP TABLE IF EXISTS campaign CASCADE',
      'DROP TABLE IF EXISTS character CASCADE',
      'DROP TABLE IF EXISTS app_user CASCADE'
    ];
    
    for (const dropStmt of dropStatements) {
      try {
        await sql(dropStmt);
        console.log(`✓ ${dropStmt}`);
      } catch (error) {
        console.log(`⚠ Skipped: ${dropStmt}`);
      }
    }
    
    // Create tables with IF NOT EXISTS
    const createTableStatements = [
      {
        sql: `CREATE TABLE IF NOT EXISTS app_user (
          userid SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255)
        )`,
        name: 'app_user'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS campaign (
          campaignid SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255),
          system VARCHAR(255) DEFAULT 'SAO RPG',
          ispublic BOOLEAN DEFAULT true
        )`,
        name: 'campaign'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS character (
          characterid SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          class VARCHAR(255),
          owneruserid INTEGER REFERENCES app_user(userid),
          campaignid INTEGER REFERENCES campaign(campaignid)
        )`,
        name: 'character'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS session (
          sessionid SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          campaignid INTEGER REFERENCES campaign(campaignid),
          starttime TIMESTAMP DEFAULT NOW(),
          endtime TIMESTAMP
        )`,
        name: 'session'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS post (
          postid SERIAL PRIMARY KEY,
          url TEXT,
          description TEXT
        )`,
        name: 'post'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS roll (
          rollid SERIAL PRIMARY KEY,
          userid INTEGER REFERENCES app_user(userid),
          purposeid TEXT,
          sessionid INTEGER REFERENCES session(sessionid),
          characterid INTEGER REFERENCES character(characterid),
          postid INTEGER REFERENCES post(postid),
          ts TIMESTAMP DEFAULT NOW()
        )`,
        name: 'roll'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS dietype (
          dietypeid SERIAL PRIMARY KEY,
          code VARCHAR(10) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          sides INTEGER NOT NULL
        )`,
        name: 'dietype'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS dieresult (
          dieresultid SERIAL PRIMARY KEY,
          rollid INTEGER REFERENCES roll(rollid),
          dietypeid INTEGER REFERENCES dietype(dietypeid),
          value INTEGER NOT NULL
        )`,
        name: 'dieresult'
      }
    ];
    
    for (const table of createTableStatements) {
      try {
        await sql(table.sql);
        console.log(`✓ Created/verified ${table.name} table`);
      } catch (error) {
        console.log(`⚠ Issue with ${table.name} table:`, error.message);
      }
    }
    
    // Insert default die types (with conflict handling)
    try {
      await sql`
        INSERT INTO dietype (code, name, sides) 
        SELECT * FROM (
          VALUES 
            ('BD', 'Basic Dice', 10),
            ('CD', 'Combo Dice', 12),
            ('LD', 'Lucky Dice', 20),
            ('MD', 'Modifier Dice', 10)
        ) AS new_values(code, name, sides)
        WHERE NOT EXISTS (
          SELECT 1 FROM dietype WHERE dietype.code = new_values.code
        )
      `;
      console.log('✓ Inserted/verified default die types');
    } catch (error) {
      console.log('⚠ Die types may already exist:', error.message);
    }

    console.log('✅ Database initialization completed successfully!');
    
    // Test the connection by querying the dietype table
    const dietypes = await sql`SELECT code, name, sides FROM dietype ORDER BY code`;
    console.log('📊 Die types created:');
    dietypes.forEach(dt => {
      console.log(`   ${dt.code}: ${dt.name} (${dt.sides} sides)`);
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();