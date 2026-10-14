# Jake's Meal Planner API

This is a NestJS-based backend for planning meals, generating shopping lists, and sending daily reminders based on a weekly meal schedule.

It is the backend portion of my Meal Planner application, a home-brewed meal planning solution for my household.

This project is currently self-hosted on my home network.

## Features

- Builds a 'plan' per week to store meals and notes for each day
- Stores added meals to catalogue of lunches and dinners
- Sync with my Notion Database of recipes to pull the ingredients & steps for each meal
- Creates a shopping list based on ingredients for each meal of the week
- Syncs with AnyList (shared list provider)
- Notifications each evening at 8pm with the meal plan for the next day
- Supports 'alert' ingredients which will be highlighted in the nightly notification (for defrosting, prep, etc.)

## Technologies

- NestJS Backend
- REST API
- PostegreSQL database

## License

This project is currently unlicensed and intended for personal or internal use.
