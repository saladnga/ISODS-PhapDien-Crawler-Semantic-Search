# Import
import os
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from sentence_transformers import SentenceTransformer
from pyvi import ViTokenizer


# Constant
vbpl_dir = "BoPhapDienDienTu/vbpl"
batch = 500
max_chunk_per_batch = 5000
vector_db_dir = "chroma_db"


# Model
model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")


# Get all html files from vbpl directory
html_files = [
    os.path.join(vbpl_dir, f) for f in os.listdir(vbpl_dir) if f.endswith(".html")
]


# Extract text from html files
documents = []
for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as file:
        soup = BeautifulSoup(file, "lxml")
        text_content = soup.get_text(separator=" ").strip()

        if text_content:
            documents.append(
                {"text": text_content, "metadata": {"file_path": file_path}}
            )


# Define the embedding function
class Embedding:
    def __init__(self, model):
        self.model = model

    def embed_documents(self, texts):
        segmented_texts = [ViTokenizer.tokenize(text) for text in texts]
        return self.model.encode(segmented_texts).tolist()


# Initialize the embedding function and vector store database
embedding_function = Embedding(model)
vector_store = Chroma(
    persist_directory=vector_db_dir, embedding_function=embedding_function
)


# Check for existing documents
existing_docs = set()
for doc in vector_store.get()["metadatas"]:
    existing_docs.add(doc["file_path"])


# Split document into chunks and add to the vector database
text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=20)
for i in range(0, len(documents), batch):
    batch_docs = documents[i : i + batch]
    texts = []
    metadatas = []

    for doc in batch_docs:
        file_path = doc["metadata"]["file_path"]

        if file_path in existing_docs:
            print(f"Skipping already indexed file: {doc['metadata']['file_path']}")
            continue

        chunks = text_splitter.split_text(doc["text"])

        for chunk in chunks:
            # Skip empty chunks
            if chunk.strip():
                texts.append(chunk)
                metadatas.append({"file_path": file_path})
            else:
                print(f"Skipping empty chunk from file {file_path}")

            # Ensure chunks do not go over its limit and texts are not empty
            if len(texts) >= max_chunk_per_batch:
                if len(texts) > 0:
                    vector_store.add_texts(texts=texts, metadatas=metadatas)
                    texts = []
                    metadatas = []

    if len(texts) > 0:
        vector_store.add_texts(texts=texts, metadatas=metadatas)
        print(f"Processed batch {i // batch + 1} with {len(texts)} chunks.")
        texts = []
        metadatas = []


# Verify persistence of the vector database
if os.path.exists(vector_db_dir) and os.listdir(vector_db_dir):
    print(
        f"Created vector database successfully and stored in directory {vector_db_dir}."
    )
else:
    print("Failed to create the vector database.")
