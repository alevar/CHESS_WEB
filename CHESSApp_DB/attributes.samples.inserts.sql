INSERT INTO AttributeKey (key_name, variable) VALUES
('Strength', 1),
('Speed', 1),
('Info', 0);

INSERT INTO AttributeKeyMap (std_key, og_key) VALUES
('Strength', 'Strength1'),
('Strength', 'Strength2'),
('Strength', 'Strength3'),
('Speed', 'Speed1'),
('Speed', 'Speed2'),
('Speed', 'Speed3'),
('Speed', 'Speed4'),
('Info', 'Information'),
('Info', 'Description');

INSERT INTO AttributeKeyValue (key_name, std_value) VALUES
('Strength', 'High'),
('Strength', 'Medium'),
('Strength', 'Low'),
('Speed', 'Fast'),
('Speed', 'Moderate'),
('Speed', 'Slow'),
('Info', '');

INSERT INTO AttributeValueMap (key_name, og_value, std_value) VALUES
('Strength', 'High1', 'High'),
('Strength', 'High2', 'High'),
('Strength', 'High3', 'High'),
('Speed', 'Fast1', 'Fast'),
('Speed', 'Fast2', 'Fast'),
('Speed', 'Fast3', 'Fast'),
('Info', '', '');