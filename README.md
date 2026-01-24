# 🏆 Tier Testing Bot

A robust Discord.js v14 bot designed to automate the competitive tier-testing process. This bot handles user requests via modals, creates private testing channels, and logs final results to a public channel.

---

## ✨ Features

* **Modal-Based Requests:** Users submit their In-Game Name (IGN) and Region through a clean UI.
* **Automated Ticketing:** Creates a private text channel for each test under a "Tests" category.
* **Role-Based Permissions:** Automatically syncs permissions so only the player and the "Tester" role can see the testing channel.
* **Result Logging:** Standardized `/postresult` command to log test outcomes in a beautiful embed.
* **Local Data Storage:** Uses JSON files for configuration, ensuring setup persists through restarts.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* A Discord Bot Token from the [Developer Portal](https://discord.com/developers/applications)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
