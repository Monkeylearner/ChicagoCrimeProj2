# Import necessary libraries
from flask import Flask, jsonify, render_template
from flask_pymongo import PyMongo
import pandas as pd
#import pymongo


# create instance of Flask app
app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/crimedb"
mongo = PyMongo(app)

# Use flask_pymongo to set up mongo connection
#conn= 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
#client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.
#db = client.crimedb

# Set route
@app.route('/')
def index():
    
    # Return the template with the teams list passed in
    return render_template('index.html')

@app.route('/data')
def crime():
    # Store the entire crimedata collection in a dictionary
    # crimes = {}
    crimes = list(mongo.db.crimedata.find({}, {'_id': False}))
    # print(crimes)
    return jsonify(crimes)

@app.route("/types")
def types():
    """Return a list of crime types."""

    # Use Pandas to perform mongo query
    crimes = list(mongo.db.crimedata.find({}, {'_id': False}))
    df = pd.DataFrame(crimes)
    type_data=df.loc[:,["assault", "burglary", "deception", "motortheft", "narcotics", "robbery", "morning", "afternoon", "evening", "night"]]
    # Return a list of the column names (types names)
    return jsonify(list(type_data))

@app.route("/samples/<sample>")
def samples(sample):
    
    crimes = list(mongo.db.crimedata.find({}, {'_id': False}))
    df = pd.DataFrame(crimes)
    print(df)
    sample_data = df.loc[:,["area", "community", sample]]
    # Format the data to send as json
    data = {
        "area": sample_data.area.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
        "community": sample_data.community.tolist(),
    }
    return jsonify(data)    

if __name__ == "__main__":
    app.run(debug=True)
