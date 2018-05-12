CREATE TABLE teams(
  chapter    VARCHAR(20) PRIMARY KEY,
  team_name  VARCHAR(30) NOT NULL
);

-- Adding all the teams to the teams table
INSERT INTO teams VALUES
  ('Alpha Phi', 'Greek Week Warriors'),
  ('Phi Gamma Delta', 'Greek Week Warriors'),
  ('Sigma Tau Gamma', 'Greek Week Warriors'),
  ('Delta Delta Delta', 'Unite The Greeks'),
  ('Alpha Sigma Phi', 'Unite The Greeks'),
  ('Pi Kappa Phi', 'Unite The Greeks'),
  ('Kappa Kappa Gamma', 'It''s Always Sunny In Greekland'),
  ('Beta Theta Pi', 'It''s Always Sunny In Greekland'),
  ('Alpha Kappa Lambda', 'It''s Always Sunny In Greekland'),
  ('Delta Sigma Phi', 'It''s Always Sunny In Greekland'),
  ('Alpha Omicron Pi', 'Fresh Greeks On The Block'),
  ('Phi Delta Theta', 'Fresh Greeks On The Block'),
  ('Phi Kappa Theta', 'Fresh Greeks On The Block'),
  ('Gamma Phi Beta', 'Greeks Day Off'),
  ('Sigma Pi','Greeks Day Off'),
  ('Theta Delta Chi', 'Greeks Day Off'),
  ('Kappa Delta', 'Greek Tropics'),
  ('Sigma Phi Epsilon', 'Greek Tropics'),
  ('Adelante', 'Greek Tropics'),
  ('Delta Gamma', 'Greeks Of The Galaxy'),
  ('Kappa Sigma','Greeks Of The Galaxy'),
  ('Lambda Chi Alpha', 'Greeks Of The Galaxy'),
  ('Alpha Gamma Delta', 'Bermuda Triaaangle'),
  ('Alpha Gamma Rho', 'Bermuda Triaaangle'),
  ('ACACIA', 'Bermuda Triaaangle'),
  ('Pi Beta Phi','Diner, Drive-Ins, And Greeks'),
  ('Phi Kappa Psi', 'Diner, Drive-Ins, And Greeks'),
  ('Theta Chi', 'Diner, Drive-Ins, And Greeks'),
  ('Chi Omega', 'Nightmare On Greek Street'),
  ('Sigma Chi', 'Nightmare On Greek Street'),
  ('Delta Upsilon', 'Nightmare On Greek Street'),
  ('Chi Phi', 'Nightmare On Greek Street'),
  ('Alpha Chi Omega', 'Chance Of Reign'),
  ('FarmHouse', 'Chance Of Reign'),
  ('Triangle', 'Chance Of Reign'),
  ('Sigma Gamma Rho', 'Chance of Reign'),
  ('Sigma Kappa', 'The Greek League'),
  ('Pi Kappa Alpha', 'The Greek League'),
  ('Delta Chi', 'The Greek League'),
  ('Phi Kappa Tau', 'The Greek League'),
  ('Delta Zeta', 'Galactic Greeks'),
  ('Beta Sigma Psi', 'Galactic Greeks'),
  ('Theta Xi', 'Galactic Greeks'),
  ('Alpha Tau Omega', 'Galactic Greeks'),
  ('Kappa Alpha Theta', 'Seuss On The Loose'),
  ('Tau Kappa Epsilon', 'Seuss On The Loose'),
  ('Alpha Sigma Kappa', 'Seuss On The Loose'),
  ('Alpha Delta Pi', 'Greeker By The Dozen'),
  ('Delta Tau Delta', 'Greeker By The Dozen'),
  ('Phi Beta Chi', 'Greeker By The Dozen');
--May need to add a w_ for each of the olympic and tournament events
CREATE TABLE event_roster(
  id            CHAR(20)    PRIMARY KEY,
  isu_id        VARCHAR(9)  NOT NULL,
  net_id        VARCHAR(20) NOT NULL,
  first_name    VARCHAR(20) NOT NULL,
  last_name     VARCHAR(20) NOT NULL,
  chapter       VARCHAR(20) NOT NULL REFERENCES teams(chapter),
  gw_role       VARCHAR(7)  NOT NULL DEFAULT '',
  w_general     BOOLEAN     NOT NULL DEFAULT false, -- true if this person has filled out a general waiver
  basketball    BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the volleyball roster
  dodgeball     BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the dodgeball roster
  lipsync       BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the track roster
  track         BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the treds roster
  treds         BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the basketball roster
  trivia        BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the trivia roster
  volleyball    BOOLEAN     NOT NULL DEFAULT false, -- true if this person is on the trivia roster
  technical     BOOLEAN     NOT NULL DEFAULT false, -- true if this person has received a technical foul in a tournament (this prohibits him or her from participating in other tournaments)
  events        TEXT[]      NOT NULL DEFAULT Array[]::TEXT[] -- array of events this person has checked in to
);
