
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'participant');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE degree_type AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'phd');
CREATE TYPE expertise_level AS ENUM ('beginner', 'intermediate', 'expert');
CREATE TYPE social_platform AS ENUM ('github', 'linkedin', 'twitter', 'portfolio', 'other');
CREATE TYPE event_type AS ENUM ('hackathon', 'general_event');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'waitlisted');
CREATE TYPE rsvp_status AS ENUM ('pending', 'confirmed', 'declined');
CREATE TYPE sponsor_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');
CREATE TYPE event_person_role AS ENUM ('speaker', 'judge');
CREATE TYPE schedule_type AS ENUM ('event', 'workshop', 'pre_event');
CREATE TYPE team_role AS ENUM ('leader', 'member');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'participant',
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    bio TEXT,
    gender gender_type,
    phone VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_education (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    degree degree_type NOT NULL,
    field_of_study VARCHAR(255),
    graduation_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_experience (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    expertise_level expertise_level NOT NULL
);

CREATE TABLE user_social_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    url VARCHAR(255) NOT NULL
);

-- Event Management Tables
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type event_type NOT NULL,
    tagline VARCHAR(255),
    about TEXT,
    max_participants INTEGER,
    min_team_size INTEGER,
    max_team_size INTEGER,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE event_themes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    UNIQUE(event_id, theme_id)
);

CREATE TABLE application_forms (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    education_required BOOLEAN DEFAULT false,
    experience_required BOOLEAN DEFAULT false,
    profiles_required BOOLEAN DEFAULT false,
    contact_required BOOLEAN DEFAULT false,
    tShirtSize_required BOOLEAN DEFAULT false
);

CREATE TABLE custom_questions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- ENUM, NUMBER, TEXT, CHECKBOX
    options JSONB, -- JSONB to store options for ENUM or CHECKBOX types
    is_required BOOLEAN DEFAULT false
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER,
    status application_status DEFAULT 'pending',
    rsvp_status rsvp_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_links (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    website_url VARCHAR(255),
    microsite_url VARCHAR(255),
    contact_email VARCHAR(255),
    code_of_conduct_url VARCHAR(255),
    social_links JSONB
);

CREATE TABLE event_branding (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    brand_color VARCHAR(50),
    logo_url VARCHAR(255),
    favicon_url VARCHAR(255),
    cover_image_url VARCHAR(255)
);

CREATE TABLE event_timeline (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    timezone VARCHAR(50),
    applications_start TIMESTAMP,
    applications_end TIMESTAMP,
    rsvp_deadline_days INTEGER,
    event_start TIMESTAMP,
    event_end TIMESTAMP
);

CREATE TABLE sponsors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    tier sponsor_tier NOT NULL,
    website_url VARCHAR(255)
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE prizes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2)
);

CREATE TABLE event_people (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role event_person_role NOT NULL,
    bio TEXT,
    image_url VARCHAR(255),
    linkedin_url VARCHAR(255)
);

CREATE TABLE schedule_items (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type schedule_type NOT NULL
);

CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL,
    UNIQUE(team_id, user_id)
);

CREATE TABLE project_submissions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_user_skills_name ON user_skills(skill_name);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_modtime
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
