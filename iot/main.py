"""This is the main program"""
import time, datetime
import requests

import RPi.GPIO as GPIO

import Adafruit_DHT

from vendor.Adafruit_BMP085.Adafruit_BMP085 import BMP085

import firebase_admin
from firebase_admin import credentials, firestore

class Iot(object):
    """This is the Iot main class.

    Args:
        object (Object): Class reference.
    """

    # Be careful to change this value, because Firebase free acc has a limit.
    #This represents the read interval in seconds.
    interval = 300
    database = None
    temperatureAndHumidityPin = 18
    bmp = BMP085(0x77)
    geoloc_url = 'https://api.ipgeolocation.io/ipgeo'
    geoloc_apikey='7f4599fb2cf546dab195e2158c984c42'
    weather_url='https://api.darksky.net/forecast/ad81fa1aa56f70d51d00344adec8def2/'

    def __init__(self):
        # setup
        GPIO.setmode(GPIO.BCM)
        # Use a Firebase service account
        cred = credentials.Certificate('key.json')
        firebase_admin.initialize_app(cred)
        self.database = firestore.client()

    def temperature_and_humidity_sensor(self):
        """This method gets the temperature and humidity values
           from the sensors and sends them to Firebase.

           Args:
                self (Context): Context reference
        """
        humidity, temperature = Adafruit_DHT.read_retry(11, self.temperatureAndHumidityPin)
        print(humidity)
        print(temperature)
        #if temperature is not None:
        #    self.send_to_firestore('temperature', round(temperature, 2))
        #if humidity is not None:
        #    self.send_to_firestore('humidity', round(humidity, 2))
        return (round(temperature, 2), round(humidity,2))

    def pressure_sensor(self):
        """This method gets the pressure value
           from the sensors and sends them to Firebase.

           Args:
                self (Context): Context reference.
        """

        pressure = self.bmp.readPressure()
        print(pressure)
        #if pressure is not None:
        #    self.send_to_firestore('pressure', int(round(pressure / 100.0, 2)))
        return round(pressure / 100.0, 2)
    
    def get_location(self):
        geores = requests.get(self.geoloc_url, {'apiKey':self.geoloc_apikey})
        if geores.status_code!=200:
            raise Exception('failed to get location')
        loc_dict = geores.json()
        lat = loc_dict['latitude']
        lon = loc_dict['longitude']
        
        return (lat,lon)
        
    def get_weather(self):
        lat, lon = self.get_location()
        url_w_params = self.weather_url+lat+','+lon
        weather_res = requests.get(url_w_params, {'units':'si'})
        if weather_res.status_code!=200:
            print(weather_res.text())
            raise Exception('failed to get weather')
        
        weather_dict = weather_res.json()
        cur_weather_dict = weather_dict.get('currently', {'time':'','temperature':0,'pressure':0,'humidity':0, 'seconds':0})
        # determine which weather items we want
        cur_unixtime = cur_weather_dict['time']
        cur_date = ''
        if cur_unixtime is not '':
            cur_date = time.strftime("%Y-%m-%d %H:%M:%S (%Z)", time.localtime(cur_unixtime))
        cur_temp = cur_weather_dict['temperature']
        cur_press = cur_weather_dict['pressure']
        cur_hum = cur_weather_dict['humidity']
        # cur temp, cur air pressure, cur humidity
        #if cur_temp is not None:
        #    self.send_to_firestore('outside-temperature',cur_temp)
        #if cur_press is not None:
        #    self.send_to_firestore('outside_pressure',cur_press)
        #if cur_hum is not None:
        #    self.send_to_firestore('outside_humidity',cur_hum)
        #if cur_date is not None:
        #    self.send_to_firestore('date', cur_date)
        print(cur_temp)
        return cur_date, cur_temp, cur_press, cur_hum, cur_unixtime    
        
        


    def send_to_firestore(self, entry):
        """This method sends the values
           to the Firebase Firestore collection.

           Args:
                self (Context): Context reference.
                collection (String): Firestore collection name.
                value (int): sensor value to be stored
        """

        

        try:
            self.database.collection(u'data').add(entry)
            print(entry)
        except Exception as exception:
            print(str(exception))

    def run(self):
        """This method runs the sensors and collects data.

           Args:
                self (Context): Context reference.
        """
        try:
            
            while True:
                new_entry={
                             'date':'',
                             'temperature':0,
                             'pressure':0,
                             'humidity':0,
                             'outdoor_temperature':0,
                             'outdoor_pressure':0,
                             'outdoor_humidity':0,
                             'seconds':0
                           }
                #TODO add in default return values for these
                tmp_temp, tmp_humidity = self.temperature_and_humidity_sensor()
                tmp_press = self.pressure_sensor()
                try:
                    tmp_date, tmp_otemp, tmp_opress, tmp_ohum, tmp_seconds = self.get_weather()
                except:
                    tmp_date, tmp_otemp, tmp_opress, tmp_ohum, tmp_seconds = ('', 0,0,0,0)
                new_entry['date']=tmp_date
                new_entry['temperature']=tmp_temp
                new_entry['pressure']=tmp_press
                new_entry['humidity']=tmp_humidity
                new_entry['outdoor_temperature']=tmp_otemp
                new_entry['outdoor_pressure']=tmp_opress
                new_entry['outdoor_humidity']=tmp_ohum
                new_entry['seconds']= tmp_seconds
                
                self.send_to_firestore(new_entry)
                
                time.sleep(self.interval)

        finally:
            GPIO.cleanup()

if __name__ == '__main__':
    MAIN = Iot()
    MAIN.run()
