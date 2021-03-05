# jarvis-worker
Jarvis worker is an intelligent worker process that pings third party like 3commas and passes data to integrations like zapier, slack, or database

# Design

Cronjob that runs once a minute. 

* The job loops through a config file with api details from 3commas, slack channel api, slack channel name
`config.example.json`
```
{
    users: [
        {
            "3commasApiKey": "safdadsf",
            "3commasSecret": "fasdsadf",
            "slackApiKey": "asdfasdfas",
            "slackSecret": "asldkfjasdf",
            "botId": 5671,
        }
    ]
}
```
* The job reads from a file that stores a dictionary/map of the user api key as the key and the last run date
`lastRan.json`
```
{
    "user1_api_key_goes_here_ababababab" : new Date(),
    "user2_api_key_goes_here_ababababab" : new Date()
}
```
* The job calls 3commas api deals history per each user. 
* The job sends to slack everything after the last date recorded in the lastRan.json