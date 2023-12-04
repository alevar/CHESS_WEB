INSERT INTO AttributeKey (std_key, variable) VALUES
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

INSERT INTO AttributeKeyValue (std_key, std_value) VALUES
('gene_type', 'protein_coding'),
('gene_type', 'lncRNA'),
('Speed', 'Fast'),
('Speed', 'Moderate'),
('Speed', 'Slow'),
('Info', '');

INSERT INTO AttributeValueMap (std_key, og_value, std_value) VALUES
('gene_type', 'protein_coding', 'protein_coding'),
('gene_type', 'coding', 'protein_coding'),
('gene_type', 'non_coding', 'lncRNA'),
('gene_type', 'long_non_coding_RNA', 'lncRNA'),
('gene_type', 'antisense', 'lncRNA'),
('Speed', 'Fast1', 'Fast'),
('Speed', 'Fast2', 'Fast'),
('Speed', 'Fast3', 'Fast'),
('Info', '', '');

SELECT std_key, GROUP_CONCAT(og_key), variable AS og_key_map
FROM AttributeKeyMap LEFT JOIN AttributeKey USING (std_key)
WHERE std_key = 'gene_type'
GROUP BY std_key;