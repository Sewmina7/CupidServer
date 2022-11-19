# Cupid Server - Matchmake with Dedicated Servers. NOT RELAYS
Cupid is a Matchmaking backend that can open game instances on demand. Just like making rooms in a relay server, This will open Game instance for each room so the Rooms can be dedicated servers instead of making the players the host.

This consists of two parts, This is the server backend written in NodeJS. Client will communicate with this and this will manage rooms and game instances.

# How to install
To install the server application, Download the repo or clone it using git command.</br>
``git clone https://github.com/Sewmina7/CupidServer.git``

Then get inside the directory where the ``app.js`` is locted, and enter </br>
``node app``</br>
to run the application.

** Make sure to Allow the API listening port and Port range for Rooms.
For default config: </br>``sudo ufw allow 1601 && sudo ufw allow 2000:3000/tcp && sudo ufw allow 2000:3000/udp``</br> (You can open only the chosen Protocol if you are worried about safety when opening both)

# Configuration
Inside the directory, There is a file called ``settings.json`` . Default Settings are like this
```
{
    "port":1601,
    "password":"xyz@123",
    "game_exe":"/root/Unity/CupidSample/Builds/Linux/Cupid.x86_64",
    "minimum_players": 2,
    "maximum_players": 5,
    "waiting_time": 30000,
    "port_range_min":2000,
    "port_range_max":3000,
    "log_level":3
}
```

Let me explain what each parameter does.

``port`` : The port on server which will listen to clients. This port must be open / allowed by firewall (ex: ``ufw allow 1601``)</br></br>
``password`` : API key to validate the client. You can enter a safe phrase to make it secure.</br></br>
``game_exe`` : Where the ``Server Build`` Of the game is located. This is the file which will be opened when making a new room. (This instance is passed the argument ``-port``. Look on Unity implementation for further details.</br></br>
``minimum_players`` : Minimum players required to start a new Room.</br></br>
``maximum_players`` : Limit of players that can be on a single Room.</br></br>
``waiting_tiem`` : Time (in miliseconds) before the Room expires. Each room will only last this amount of time</br></br>
``port_range_min`` : Lower bound of the Port range available for Rooms. </br></br>
``port_range_max`` : Higher bound of the Port range available for Rooms.</br></br>
``log_level`` : What the application will spit. ( 0:only necessary, 1:debug, 2:verbose )