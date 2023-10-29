# Defines the database models for the CHESSApp_back Flask app
# Please put all database models in this file
# A database model is a class that represents a table in the database
# Please provide documentation for each database model
# Please provide a __repr__ method for each database model
# Please provide a comment for each database model that explains what it represents

from CHESSApp_back import db
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Enum, Float, TIMESTAMP, Boolean, UniqueConstraint, Index, BigInteger, SmallInteger, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Organisms(Base):
    __tablename__ = 'Organisms'

    scientificName = Column(String(45), primary_key=True)
    commonName = Column(String(45), nullable=False, unique=True)
    information = Column(Text)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Assemblies(Base):
    __tablename__ = 'Assemblies'

    assemblyName = Column(String(45), primary_key=True)
    information = Column(Text, nullable=False)
    link = Column(Text, nullable=False)
    organismName = Column(String(45), ForeignKey('Organisms.scientificName'), nullable=False)
    organism = relationship("Organisms")

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class SequenceIDs(Base):
    __tablename__ = 'SequenceIDs'

    assemblyName = Column(String(45), ForeignKey('Assemblies.assemblyName'), primary_key=True)
    sequenceID = Column(String(45), primary_key=True)
    length = Column(Integer, nullable=False)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Transcripts(Base):
    __tablename__ = 'Transcripts'

    tid = Column(Integer, primary_key=True, autoincrement=True)
    assemblyName = Column(String(45), ForeignKey('Assemblies.assemblyName'), nullable=False)
    sequenceID = Column(String(45), ForeignKey('SequenceIDs.sequenceID'), nullable=False)
    strand = Column(Boolean, nullable=False)
    start = Column(Integer, nullable=False)
    end = Column(Integer, nullable=False)
    exons = Column(Text, nullable=False)
    lastUpdated = Column(TIMESTAMP, nullable=False)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Sources(Base):
    __tablename__ = 'Sources'

    sourceID = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(45), nullable=False, unique=True)
    information = Column(Text, nullable=False)
    link = Column(Text, nullable=False)
    originalFormat = Column(Enum("gtf", "gff"), nullable=False)
    lastUpdated = Column(String(45))

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Genes(Base):
    __tablename__ = 'Genes'

    gid = Column(String(50), primary_key=True)
    name = Column(String(45), nullable=False)
    type = Column(Enum("protein_coding", "lncRNA", "ncRNA", "miscRNA", "antisenseRNA"), nullable=False)
    description = Column(Text)
    sourceID = Column(Integer, ForeignKey('Sources.sourceID'), nullable=False)
    source = relationship("Sources")

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class TranscriptToGene(Base):
    __tablename__ = 'TranscriptToGene'

    tid = Column(Integer, ForeignKey('Transcripts.tid'), primary_key=True)
    gid = Column(String(50), ForeignKey('Genes.gid'), primary_key=True)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Datasets(Base):
    __tablename__ = 'Datasets'

    datasetID = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(45), nullable=False, unique=True)
    sampleCount = Column(Integer, nullable=False)
    information = Column(Text, nullable=False)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class TranscriptToDataset(Base):
    __tablename__ = 'TranscriptToDataset'

    tid = Column(Integer, ForeignKey('Transcripts.tid'), primary_key=True)
    datasetID = Column(Integer, ForeignKey('Datasets.datasetID'), primary_key=True)
    sampleCount = Column(Integer, nullable=False)
    expressionMean = Column(Float, nullable=False)
    expressionStd = Column(Float, nullable=False)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class TxDBXREF(Base):
    __tablename__ = 'TxDBXREF'

    tid = Column(Integer, ForeignKey('Transcripts.tid'), primary_key=True)
    sourceID = Column(Integer, ForeignKey('Sources.sourceID'), primary_key=True)
    transcript_id = Column(String(50), nullable=False)
    type = Column(Enum("protein_coding", "non_coding", "antisense", "pseudo", "trna", "mirna", "snorna", "snrna", "rrna", "sirna"))
    cds = Column(Text)
    start = Column(Integer, nullable=False)
    end = Column(Integer, nullable=False)
    score = Column(SmallInteger)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Attributes(Base):
    __tablename__ = 'Attributes'

    tid = Column(Integer, ForeignKey('Transcripts.tid'), primary_key=True)
    sourceID = Column(Integer, ForeignKey('Sources.sourceID'), primary_key=True)
    transcript_id = Column(String(45), nullable=False)
    name = Column(String(45), nullable=False)
    value = Column(Text, nullable=False)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class SequenceIDMap(Base):
    __tablename__ = 'SequenceIDMap'

    assemblyName = Column(String(45), ForeignKey('SequenceIDs.assemblyName'), primary_key=True)
    sequenceID = Column(String(45), ForeignKey('SequenceIDs.sequenceID'), primary_key=True)
    alternativeID = Column(String(45), primary_key=True)
    nomenclature = Column(String(45), primary_key=True)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class AllCountSummary (Base):
    __tablename__ = 'AllCountSummary'

    OrganismName = Column(String(45), primary_key=True)
    AssemblyName = Column(String(45), primary_key=True)
    SourceName = Column(String(45), primary_key=True)
    lastupdated = Column(TIMESTAMP)
    TotalTranscripts = Column(Integer)
    TotalGenes = Column(Integer)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    