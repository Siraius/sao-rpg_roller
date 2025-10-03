-- Database initialization script for SAO RPG Roller
-- This script creates all the required tables based on the schema

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS dieresult CASCADE;
DROP TABLE IF EXISTS dietype CASCADE;
DROP TABLE IF EXISTS roll CASCADE;
DROP TABLE IF EXISTS post CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS campaign CASCADE;
DROP TABLE IF EXISTS character CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- Create app_user table
CREATE TABLE app_user (
    userid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255)
);

-- Create character table
CREATE TABLE character (
    characterid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(255),
    owneruserid INTEGER REFERENCES app_user(userid),
    campaignid INTEGER
);

-- Create campaign table
CREATE TABLE campaign (
    campaignid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    system VARCHAR(255) DEFAULT 'SAO RPG',
    ispublic BOOLEAN DEFAULT true
);

-- Create session table
CREATE TABLE session (
    sessionid SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    campaignid INTEGER REFERENCES campaign(campaignid),
    starttime TIMESTAMP DEFAULT NOW(),
    endtime TIMESTAMP
);

-- Create post table
CREATE TABLE post (
    postid SERIAL PRIMARY KEY,
    url TEXT,
    description TEXT
);

-- Create roll table
CREATE TABLE roll (
    rollid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES app_user(userid),
    purposeid TEXT,  -- Using TEXT for purpose description
    sessionid INTEGER REFERENCES session(sessionid),
    characterid INTEGER REFERENCES character(characterid),
    postid INTEGER REFERENCES post(postid),
    ts TIMESTAMP DEFAULT NOW()
);

-- Create dietype table
CREATE TABLE dietype (
    dietypeid SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sides INTEGER NOT NULL
);

-- Create dieresult table
CREATE TABLE dieresult (
    dieresultid SERIAL PRIMARY KEY,
    rollid INTEGER REFERENCES roll(rollid),
    dietypeid INTEGER REFERENCES dietype(dietypeid),
    value INTEGER NOT NULL
);

-- Insert default die types
INSERT INTO dietype (code, name, sides) VALUES
    ('BD', 'Basic Dice', 10),
    ('CD', 'Combo Dice', 12),
    ('LD', 'Lucky Dice', 20),
    ('MD', 'Modifier Dice', 10);

-- Add foreign key constraint for character.campaignid after campaign table is created
ALTER TABLE character ADD CONSTRAINT fk_character_campaign 
    FOREIGN KEY (campaignid) REFERENCES campaign(campaignid);

-- Create indexes for better performance
CREATE INDEX idx_roll_userid ON roll(userid);
CREATE INDEX idx_roll_sessionid ON roll(sessionid);
CREATE INDEX idx_roll_characterid ON roll(characterid);
CREATE INDEX idx_dieresult_rollid ON dieresult(rollid);
CREATE INDEX idx_character_owneruserid ON character(owneruserid);
CREATE INDEX idx_session_campaignid ON session(campaignid);

-- Display table creation results
SELECT 'Database initialization complete!' as status;