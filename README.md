# jarvis-worker
Jarvis worker is an intelligent worker process that pings third party like 3commas and passes data to integrations like zapier, slack, or database

# Design

Cronjob that runs once a minute. 

* The job loops through a config file with api details from 3commas, slack channel api, slack channel name. connections is used for each connection you want to establish. I have
a history channel of all my history for a bot, and I also have a profit channel for every profit done by the bot. I hate logging into 3commas and refreshing just to see my stats, I'd like to have it in slack right here. Been nice to have these alerts go off while snowboarding, etc.

`config.example.json`
```
{
    "users": [
        {
            "commasApiKey": "...",
            "commasSecret": "...",
            "slackToken": "...",
            "botId": 2786356,
            "connections": [{
                "connection": "history",
                "source": "3commas",
                "destination": "slack",
                "channelName": "history"
            },{
                "connection": "profit",
                "source": "3commas",
                "destination": "slack",
                "channelName": "profit"
            }]
        }
    ]
}
```
* The job reads from a map in memmory. It defines the user api as the key and the last run date as the value
`lastRan in the database`
```
{
    "user1_api_key_goes_here_ababababab" : new Date(),
    "user2_api_key_goes_here_ababababab" : new Date()
}
```
* The job calls 3commas api deals history per each user. 
* The job sends to slack everything after the last date recorded in the lastRan

## Installing google cloud
* Install google cloud in home directory of mac

## Set the projectId
* ```~/./google-cloud-sdk/bin/gcloud config set project jarvis-306805```

## Deploy the app
* ```~/./google-cloud-sdk/bin/gcloud app deploy```
