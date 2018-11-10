import pandas as pd
import time
from splinter import Browser
from bs4 import BeautifulSoup as bs
import tweepy
import pymongo

# Initialize browser
def init_browser():
    
    executable_path = {'executable_path': '/Users/luoling/Downloads/geckodriver'}

    return Browser("firefox", **executable_path, headless=False)
    time.sleep(10)


# Function to scrape
def scrape():
    mars_data = {}

    mars_data["news_data"] = marsNewsData()

    mars_data["featured_image_url"] = marsFeaturedImageURL()

    mars_data["mars_weather"] = marsWeather()

    mars_data["mars_facts"] = marsFacts()

    mars_data["mars_hemispheres"] = marsHemisphereImageURLs()

    # return mars_data dict
    return mars_data

def marsNewsData():
    news_data = {}
    paragraph_text = []
    browser = init_browser()
    url = "https://mars.nasa.gov/news/"
    browser.visit(url)
    html = browser.html
    time.sleep(5)

    news_soup = bs(html, 'html.parser')
    news_title = news_soup.find_all('div', class_='content_title')
    news_p = news_soup.find_all('div', class_='rollover_description_inner')
    news_data["news_title"] = news_title[0].text
    news_data["paragraph_text"] = news_p[0].text

    return news_data

def marsFeaturedImageURL():

    browser = init_browser()
    url_images = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(url_images)
    time.sleep(5)
    html = browser.html
    img_soup = bs(html, 'html.parser')
    time.sleep(5)
    img = img_soup.find("img", class_="thumb")["src"]
    img_url = "https://jpl.nasa.gov"+img
    featured_image_url = img_url
    return featured_image_url

def marsWeather():
   # Twitter API Keys
    consumer_key = "jCuMds8hkjry8JV8JDEuDVH9o"
    consumer_secret = "psgKB7nb05kZqoD2ZFPrG78OqbObHySWUEhcLFcZ03qVMlsCwp"
    access_token = "814999527451148288-PVho6BBmmcQbSVKOHBt3E5jbPJM6Krl"
    access_token_secret = "a30jMaE70P2kefPFOzrfGTlA06okUcifkjJB9g2JWq4Ih"
# Setup Tweepy API Authentication
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    api = tweepy.API(auth, parser=tweepy.parsers.JSONParser())
# Target User
    target_user = "@MarsWxReport"
# Retrive latest tweet
    tweet = api.user_timeline(target_user)
    mars_weather = tweet[0]['text']

    return mars_weather

def marsFacts():
    """ Function: Mars facts data scraping functionality
        Scrapes Space-Facts site @ facts_url below
        Parameters: None
        Returns facts_table string (HTML) """

    facts_url = 'https://space-facts.com/mars/'
    fact_list = pd.read_html(facts_url)
    time.sleep(5)
    facts_df = fact_list[0]
    facts_table = facts_df.to_html(header=False, index=False)

    return facts_table

def marsHemisphereImageURLs():
    browser = init_browser()

    usgs_url = 'https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars'
    browser.visit(usgs_url)
    time.sleep(5)

    usgs_html = browser.html
    usgs_soup = bs(usgs_html, 'html.parser')
    time.sleep(5)

    hemisphere_image_urls = []

    products = usgs_soup.find('div', class_='result-list')
    time.sleep(5)
    hemispheres = products.find_all('div', class_='item')
    time.sleep(5)

    for hemisphere in hemispheres:
        title = hemisphere.find('div', class_='description')

        title_text = title.a.text
        title_text = title_text.replace(' Enhanced', '')
        browser.click_link_by_partial_text(title_text)

        usgs_html = browser.html
        usgs_soup = bs(usgs_html, 'html.parser')

        image = usgs_soup.find('div', class_='downloads').find('ul').find('li')
        img_url = image.a['href']

        hemisphere_image_urls.append({'title': title_text, 'img_url': img_url})

        browser.click_link_by_partial_text('Back')

    return hemisphere_image_urls

if __name__ == "__main__":
    print(scrape())

