# Public ICES

## Motivation

When selecting classes at the Univeristy of Illinois, students weigh GPA and Professor ratings to decide between sections. There are multiple sites showing GPA data, notably [Grade disparity](https://waf.cs.illinois.edu/discovery/grade_disparity_between_sections_at_uiuc/) and [1010labs](https://1010labs.org/gpa). However, these sites lack in-depth reviews for professors, simply showing their average GPA in a course section. So students must check external sites, like Reddit or RateMyProfessor, for details regarding instruction quality, workload, etc. Thus, the goal for this website is to provide a combined interface for both GPA data and Professor reviews.

A similar [website](https://uiucmcs.org/) exists for the MCS program at UIUC. This project seeks to not just replicate, but expand on its functionality.

## Features

The website contains a GPA Inflation visualizer, where not just an average GPA is displayed, but the change in GPA for a certain course over time. This renders as an interactive, color-coded graph using Google Charts. 

The review portion of the website is similar to that of UIUCMCS.org. Users can leave anonymous reviews for classes and professors, providing custom numerical ratings for relevant fields like workload, instruction quality, difficulty, etc. Users can sign in to claim a username.

If a user creates an account, they can favorite classes and access a specialized view for them. They can compare different attributes of favorited classes, proving useful for planning a course schedule.

## Implementation

Course data is pulled from various datasets in professor Wade Fagen-Ulmschneider's [datasets repository](https://github.com/wadefagen/datasets) in the data_prep folder. From this respository, we get:

- A GPA dataset, which we group by professor and term. This serves as the basis for our GPA table.
- A dataset of all courses offered at UIUC, which is used as the basis for our Courses table.
- A dataset of all professors ranked as “Excellent” from the ICES forms, a univeristy-wide teaching survey filled out by students at the end of every semester. This provides a baseline professor rating, and is used as the basis for our Professors table.

The databases were hosted under GCP under a CS411 license. Express.js is used for the backend, and Bootstrap is used extensively in the frontend.

## Team

Joseph Chen
Jade Lundy