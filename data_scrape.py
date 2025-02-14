# Import
import os
import requests
import threading
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from queue import Queue
from concurrent.futures import ThreadPoolExecutor, as_completed


# URLs and base directory
full_base_url = "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID={}"
property_base_url = "https://vbpl.vn/tw/Pages/vbpq-thuoctinh.aspx?&ItemID={}"
history_base_url = "https://vbpl.vn/tw/Pages/vbpq-lichsu.aspx?&ItemID={}"
related_base_url = "https://vbpl.vn/TW/Pages/vbpq-vanbanlienquan.aspx?ItemID={}"
pdf_base_url = "https://vbpl.vn/tw/Pages/vbpq-van-ban-goc.aspx?ItemID={}"
base_dir = "BoPhapDienDienTu"

# Directories
demuc_dir = os.path.join(base_dir, "demuc")
vbpl_dir = os.path.join(base_dir, "vbpl")
property_dir = os.path.join(base_dir, "property")
history_dir = os.path.join(base_dir, "history")
related_dir = os.path.join(base_dir, "related")
pdf_dir = os.path.join(base_dir, "pdf")


# Ensure all directories are created
os.makedirs(vbpl_dir, exist_ok=True)
os.makedirs(property_dir, exist_ok=True)
os.makedirs(history_dir, exist_ok=True)
os.makedirs(pdf_dir, exist_ok=True)
os.makedirs(related_dir, exist_ok=True)


# Initialize ChromeDriver to download PDF files
chromedriver_path = "chromedriver/chromedriver"
webdriver_pool = Queue()
max_workers = 5
webdriver_lock = threading.Lock()


# Initialize WebDriver pool
def init_webdriver():
    for _ in range(max_workers):
        options = Options()
        service = Service(chromedriver_path)
        driver = webdriver.Chrome(service=service, options=options)
        webdriver_pool.put(driver)


# Get a WebDriver instance
def get_webdriver():
    with webdriver_lock:
        return webdriver_pool.get()


# Return a WebDriver instance to the pool
def return_webdriver(driver):
    with webdriver_lock:
        webdriver_pool.put(driver)


# Extract IDs from HTML files
def extract_item_ids(demuc_dir):
    item_ids = set()
    for root, _, files in os.walk(demuc_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    soup = BeautifulSoup(f.read(), "lxml")
                    for link in soup.find_all("a", href=True):
                        href = link["href"]
                        if "ItemID=" in href:
                            item_id = href.split("ItemID=")[1].split("&")[0]
                            item_ids.add(item_id)
    return item_ids


# Download HTML files from the URL
def download_html(html_url, save_path):
    if os.path.exists(save_path):
        print(f"Skipping HTML file - already exists: {save_path}")
        return

    try:
        response = requests.get(html_url)
        if response.status_code == 200:
            with open(save_path, "wb") as file:
                file.write(response.content)
            print(f"HTML file downloaded successfully - {save_path}")
    except requests.RequestException as e:
        print(f"Failed to download HTML file - {html_url} : {e}")


# Find the element for Selenium to download PDF files
def find_element(driver, xpath):
    try:
        return driver.find_element(By.XPATH, xpath)
    except Exception as e:
        print(f"Error finding element by XPath: {e}")
        return None


# Download PDF files from the URL using Selenium
def download_pdf(url, save_path):
    if os.path.exists(save_path):
        print(f"PDF file already exists: {save_path}")
        return

    attempts = 3
    for attempt in range(1, attempts + 1):
        driver = None
        try:
            driver = get_webdriver()
            driver.get(url)
            time.sleep(10)

            pdf_window = find_element(driver, "//object")
            if pdf_window:
                relative_pdf_url = pdf_window.get_attribute("data")
                if relative_pdf_url:
                    if relative_pdf_url.startswith("https://vbpl.vn") == False:
                        pdf_url = f"https://vbpl.vn{relative_pdf_url.lstrip('/')}"
                    else:
                        pdf_url = relative_pdf_url

                    print(f"Found PDF URL at {pdf_url}")

                    response = requests.get(pdf_url, timeout=(30, 1200))
                    if response.status_code == 200:
                        with open(save_path, "wb") as file:
                            file.write(response.content)
                        print(f"PDF downloaded successfully: {save_path}")
                        return
                else:
                    print("PDF URL not found on the page")
            else:
                print("Cannot locate PDF")

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
        finally:
            if driver:
                return_webdriver(driver)

        time.sleep(5)
    print(f"Failed to download PDF after {attempts} attempts: {url}")


# Download all files with given ItemIDs
def scrape_item(item_id):
    urls = {
        "full_doc": (full_base_url, "full_{}.html", vbpl_dir),
        "property": (property_base_url, "p_{}.html", property_dir),
        "history": (history_base_url, "h_{}.html", history_dir),
        "related": (related_base_url, "r_{}.html", related_dir),
        "pdf": (pdf_base_url, "p_{}.pdf", pdf_dir),
    }

    for type, (url, file_name, dir) in urls.items():
        url = url.format(item_id)
        file_name = file_name.format(item_id.split("#")[0])
        file_path = os.path.join(dir, file_name)

        if type == "pdf":
            download_pdf(url, file_path)
        else:
            download_html(url, file_path)


# Execution (multiprocessing)
full_item_ids = extract_item_ids(demuc_dir)
init_webdriver()

try:
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(scrape_item, item_id) for item_id in full_item_ids]
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error processing item: {e}")
except KeyboardInterrupt:
    print("Exit")
finally:
    while not webdriver_pool.empty():
        driver = webdriver_pool.get()
        driver.quit()
