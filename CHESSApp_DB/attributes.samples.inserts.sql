INSERT INTO AttributeKey (key_name, variable) VALUES
('gene_type', 0),
('Speed', 0),
('Info', 1);

INSERT INTO AttributeKeyMap (std_key, og_key) VALUES
('gene_type', 'gene_type'),
('gene_type', 'gene_biotype'),
('Speed', 'Speed1'),
('Speed', 'Speed2'),
('Speed', 'Speed3'),
('Speed', 'Speed4'),
('Info', 'Information'),
('Info', 'Description');

INSERT INTO AttributeKeyValue (key_name, value) VALUES
('gene_type', 'protein_coding'),
('gene_type', 'lncRNA'),
('Speed', 'Fast'),
('Speed', 'Moderate'),
('Speed', 'Slow'),
('Info', '');

INSERT INTO AttributeValueMap (key_name, og_value, std_value) VALUES
('gene_type', 'protein_coding', 'protein_coding'),
('gene_type', 'coding', 'protein_coding'),
('gene_type', 'non_coding', 'lncRNA'),
('gene_type', 'long_non_coding_RNA', 'lncRNA'),
('gene_type', 'antisense', 'lncRNA'),
('Speed', 'Fast1', 'Fast'),
('Speed', 'Fast2', 'Fast'),
('Speed', 'Fast3', 'Fast'),
('Info', '', '');