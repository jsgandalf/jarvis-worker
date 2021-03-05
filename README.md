# jarvis-worker
Jarvis worker is an intelligent worker process that pings third party like 3commas and passes data to integrations like zapier, slack, or database

# Design

Cronjob that runs once a minute. 

* The job loops through a config file with api details from 3commas, slack channel api, slack channel name
`config.example.json`
```
{
    "users": [
        {
            "3commasApiKey": "...",
            "3commasSecret": "...",
            "slackApiKey": "...",
            "slackSecret": "...",
            "botId": 2786356,
            "connections": [{
                "connection": "history",
                "source": "3commas",
                "destination": "slack",
                "channelName": "history"
            }]
        }
    ]
}
```
* The job reads from a file that stores a dictionary/map of the user api key as the key and the last run date
`lastRan.json`
```
{
    "users": [{
        "user1_api_key_goes_here_ababababab" : new Date(),
        "user2_api_key_goes_here_ababababab" : new Date()
    }]
}
```
* The job calls 3commas api deals history per each user. 
* The job sends to slack everything after the last date recorded in the lastRan.json