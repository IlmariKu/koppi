kysymys = {
    "type": "calculate",
    "text_templates": [
        "str1 str2 eteenpäin int1 m/s nopeudella. Kuinka monta metriä str1 taittaa int2 sekunnin kuluessa?"],
    "difficulty": 3,  # 0-10
    "int_range": [2, 100],
    "anwer_template": int1 * int2,
    "text_options": {
        "str1": [
            "orava",
            "professori",
            "susanna"
        ],
        "str2": [
            "ui",
            "heitetään",
            "ajaa"
        ]
    }
}

kysymys = {
    "type": "flashcard",
    "text": "str1 str2 eteenpäin int1 m/s nopeudella. Kuinka monta metriä str1 taittaa int2 sekunnin kuluessa?"
}
