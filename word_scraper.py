import bs4
import pymongo
from urllib.request import urlopen as uReq
from bs4 import BeautifulSoup as soup

# Initial values wordLength and alphabetPtr
wordLength = 2
alphabetPtr = 0
count = 0
# This list is used to update the URL
alphabet = list('abcdefghijklmnopqrstuvwxyz')

# Mongo client
mongoClient = pymongo.MongoClient("mongodb://localhost:27017/")
database = mongoClient["test"]
shortWords = database["short_words"]
mediumWords = database["medium_words"]
longWords = database["long_words"]

curCol = shortWords
print("=====Scraping Words of Length " + str(wordLength) + "=====")
while (alphabetPtr <= len(alphabet)) and (wordLength <= 28):
    if wordLength > 9:
        curCol = mediumWords
        counter = 0
    if wordLength > 19:
        curCol = longWords
        counter = 0

    # Dynamically build the URL using the condition variables
    url = "https://www.morewords.com/wordsbylength/" + str(wordLength) + alphabet[alphabetPtr]

    # BeautifulSoup client
    uClient = uReq(url)
    page_html = uClient.read()
    uClient.close()

    # Store the html contents
    page_soup = soup(page_html, "html.parser")

    # Get the number of words that are of length wordLength
    for e in page_soup.h3.text.split():
        if e.isdigit():
            limit = int(e)

    # The limit will be 0 if no words that start with the current letter
    # and the current length exist
    if limit == 0:
        print(alphabet[alphabetPtr] + " doesn't exist")
    else:
        print("Word count: " + str(limit))
        # Create an object for values within the range
        # The first instance of a with an href is never a 'word' so the range starts at 1
        for word in range(1, limit+1):
            count +=1
            wordObj = {
                        '_id' : count,
                        'word' : page_soup.find_all('a', href=True)[word].text,
                        'length' : wordLength,
                        'startingLetter' : alphabet[alphabetPtr]
                      }
            curCol.insert_one(wordObj)
            print(str(wordObj) + " successfully inserted")
    # Increment the alphabetPtr to update the URL and progress the while loop
    alphabetPtr +=1
    # If the alphabetPtr is currently pointing to z,
    # reset it and increment the wordLength to update URL and to progress the while loop
    if alphabetPtr == len(alphabet):
        alphabetPtr = 0
        wordLength +=1
        print("=====Scraping Words of Length " + str(wordLength) + "=====")

print(wordLength)
