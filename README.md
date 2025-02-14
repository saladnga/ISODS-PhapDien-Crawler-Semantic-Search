
# ISODS-PhapDien-Crawler-Semantic-Search




## This project involves three main tasks:

- Crawling the PhapDien website to download and organize legal documents

- Creating a vector database using ChromaDB and LangChain for efficient document storage and retrieval

- Performing semantic search on the vector database to retrieve the most relevant documents

## I. Crawling the PhapDien Website
### Objective:

- Download and organize legal documents from the [PhapDien website](phapdien.moj.gov.vn) into structured directories for further processing

### Approach:

1.‎ Download PhapDien:
-   PhapDien link:  https://phapdien.moj.gov.vn/Pages/chi-tiet-bo-phap-dien.aspx
2.‎ Create Additional Directories:
- vbpl: For full text HTML documents
- property: For property pages of the documents
- history: For history pages of the documents
- related: For related pages of the documents
- pdf: For PDF files of the documents
3.‎ Crawl and Save HTML Documents:
- Use os and BeautifulSoup to extract and iterate through unique ItemIDs from the index HTML files in the BoPhapDienDienTu/demuc directory
- For each ItemIDs, construct their correspond URLs and save their content using request:
    - For full text:
	    - URL: https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=<ItemID>
	    - File path: full_<ItemID>.html
	    - Designated directory: BoPhapDienDienTu/vbpl
    + For property:
	    - URL: https://vbpl.vn/tw/Pages/vbpq-thuoctinh.aspx?&ItemID=<ItemID>
	    - File path: p_<ItemID>.html
        - Designated directory: BoPhapDienDienTu/property
    + For history
	    - URL: https://vbpl.vn/tw/Pages/vbpq-lichsu.aspx?&ItemID=<ItemID>
	    - File path: h_<ItemID>.html
	    - Designated directory: BoPhapDienDienTu/history
    + For related:
	    - URL: https://vbpl.vn/tw/Pages/vbpq-vanbanlienquan.aspx?&ItemID=<ItemID>
	    - File path: r_<ItemID>.html
	    - Designated directory: BoPhapDienDienTu/related
4.‎ Download PDF Files Dynamically:
- Use Selenium and ChromDriver to extract and download PDF files. 
- Locate the PDF link in the data attribute of the <object> tag using XPath
    + For PDF:
        - URL: https://vbpl.vn/tw/Pages/ vbpq-van-ban-goc?&ItemID=<ItemID>
	    - File path: pdf_<ItemID>.pdf
	    - Designated directory: BoPhapDienDienTu/pdf
5.‎ Optimize Downloads with Multiprocessing:
- Use ThreadPoolExecutor from the concurrent.futures module download files concurrently, significantly speeding up the process


## II. Creating a Vector Database Using ChromaDB

### Objective:

- Ingest the crawled documents (full-text HTML files) into a vector database for efficient storage and retrieval


### Approach:

1.‎ Batch Processing:
- Split the full text HTMl files into smaller batches (500 files per batch to handle large datasets efficiently
- Set a maximum chunks size (5000) to ensure efficiency while ingesting the documents
2.‎ Text Extraction:
- Use BeautifulSoup to extract text from the HTML files, normalize the text by removing extra spaces, special characters, and HTML tags
3.‎ Text Segmentation:
- Use ViTokenizer from the pyvi library to segment Vietnamese text for better
4.‎ Embedding with BKAI Vietnamese Bi Encoder model:
- Initialize the BKAI Vietnamese Bi Encoder for generate embeddings
- Split documents into chunks of 2000 characters with an overlap of 20 to ensure meaningful embedding
5.‎ Create Vector Database:
- Initialize a ChromaDB vector store
- Add the processed documents to the vector database, including file paths as metadata for traceability
- Save the vector database directory as chroma_db


## III. Semantic Search on the Vector Database

### Objective:

- Perform semantic search on the vector database to retrieve the most relevant documents for a given query

### Approach:

1.‎ Query Processing:
- Segment the query using ViTokenizer for Vietnamese text
- Replace informal phrases with formal ones using the custom slang.json file for improved accuracy, also remove any punctuations
2.‎ Embedding the Query:
- Use the BKAI Vietnamese Bi Encoder model to generate an embedding for the query
3.‎ Similarity Search:
- Use LangChain’s similarity search to find the most relevant documents in the vector database
- Sort the results by relevance score in descending order
4.‎ Return Top-k Results:
- Display the top-k results sorted by their relevance scores



## Installation

- Required External Libraries and Modules:
    + requests
    + BeautifulSoup
    + lxml
    + concurrent.futures
    + selenium
    + pyvi
    + transformers
    + langchain
    + chromadb
- Run this command:
```bash
  pip install requests beautifulsoup4 lxml selenium concurrent.futures pyvi transformers langchain chromadb 
```
- Or:
```bash
  pip install -r requirements.txt
```
    
## References

 - [requests Documentation](https://requests.readthedocs.io/en/latest/)
 - [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
 - [Selenium Documentation](https://www.selenium.dev/documentation/)
- [LangChain Documentation](https://python.langchain.com/docs/introduction/)
- [ChromaDB Documentation](https://docs.trychroma.com/integrations/frameworks/langchain)
- [pyvi Documentation](https://github.com/trungtv/pyvi)
- [BKAI Vietnamese Bi Encoder Model Documentation](https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder)


## Author

[Vu Hoang - saladnga](https://github.com/saladnga)

