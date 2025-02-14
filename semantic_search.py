# Import
from langchain_chroma import Chroma
from sentence_transformers import SentenceTransformer
from pyvi import ViTokenizer
import re
import json


vector_db_dir = "chroma_db"


# Define the Embedding Function
class Embedding:
    def __init__(self, model, slang="slang.json"):
        self.model = model
        self.slang = self.load_slang(slang)

    def load_slang(self, file):
        with open(file, "r", encoding="utf-8") as f:
            return json.load(f)

    def preprocess_text(self, text):
        text = re.sub(r"[^\w\s]", "", text)
        for slang, formal in self.slang.items():
            text = re.sub(rf"\b{slang}\b", formal, text)
        return text

    def embed_query(self, text):
        updated_query = self.preprocess_text(text)
        segmented_query = ViTokenizer.tokenize(updated_query)
        return self.model.encode(segmented_query).tolist()


# Initialize the model
model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")


# Initialize the vector database
vector_store = Chroma(
    persist_directory=vector_db_dir,
    embedding_function=Embedding(model),
)


# Check empty database
num_docs = len(vector_store.get()["ids"])
if num_docs == 0:
    print("No documents found in the database")


# Semantic search function, top k value
def semantic_search(query, k):
    segmented_query = vector_store._embedding_function.embed_query(query)
    results = vector_store.similarity_search_by_vector_with_relevance_scores(
        segmented_query, k=k
    )

    def get_relevance_score(item):
        return item[1]

    return sorted(results, key=get_relevance_score, reverse=True)


# Execution
query = "chính sách phát triển y tế của nhà nước"
k = 5
results = semantic_search(query, k)

print(f"TOP {k} RESULTS FOR QUERY -'{query}':")
for i, (text, _) in enumerate(results):
    print("--------------------------------------------------------------------------")
    print(f"RESULT NO. {i + 1}: ")
    print("--------------------------------------------------------------------------")
    print(f"METADATA (FILE PATH): {text.metadata}")
    print(f"CONTENT:\n {text.page_content}")
    print("--------------------------------------------------------------------------")
