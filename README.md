<b>Chat-App</b> - Your Personal Chat Application.<br><br>
Chat-App is a simple and secure chat application where you have messages stored on your own server. You can also customize according to your own requirement and add some more cool and interesting feature. To do so, just clone the repo and start coding.

<img src="./screenshots/screenshot.png" style="width:100%">
<img src="./screenshots/DarkMode.png" style="width:100%">
<b>Prerequisite</b>
<hr>
1. Node.js - App server<br>
2. Postgresql - Database ,(or you can use your own database server as per interest and experience)<br><br>

<b>Step 1 - Install Node.js</b><br>
<hr>
Ignore if already installed on the system

<b>For Ubuntu Users -</b>

<i>sudo apt install nodejs<br>
sudo apt install npm<br>
nodejs -v<br>
npm i nodemon -g<br>
</i><br>
<b>For Windows Users -</b>

<i>In a web browser, navigate to https://nodejs.org/en/download/. Click the Windows Installer button to download the latest default version. At the time this article was written, version 10.16.0-x64 was the latest version. The Node.js installer includes the NPM package manager.<br>

1. Once the installer finishes downloading, launch it. Open the downloads link in your browser and click the file. Or, browse to the location where you have saved the file and double-click it to launch.<br>
2. The system will ask if you want to run the software – click Run.<br>
3. You will be welcomed to the Node.js Setup Wizard – click Next.<br>
4. On the next screen, review the license agreement. Click Next if you agree to the terms and install the software.<br>
5. The installer will prompt you for the installation location. Leave the default location, unless you have a specific need to install it somewhere else – then click Next.<br>
6. The wizard will let you select components to include or remove from the installation. Again, unless you have a specific need, accept the defaults by clicking Next.<br>
7. Finally, click the Install button to run the installer. When it finishes, click Finish.<br>

node –v<br>
npm i nodemon -g<br>
</i>

<b>Step 2. Install Postgresql</b>
<hr>
Ignore if already installed on the system

<b>For Ubuntu Users -</b>

<i>sudo apt-get install wget ca-certificates<br>
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -<br>
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ lsb_release -cs-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'<br>
sudo apt-get update<br>
sudo apt-get install postgresql postgresql-contrib<br>

sudo apt show postgresql
</i>

<b>For Windows Users -</b>

Go to https://www.guru99.com/download-install-postgresql.html and follow the steps as mentioned.

<strong>Finally create required tables, ref - <a href='./schema_design'>Table Structure</a></strong><br><br>
  
 <b>Run app -</b><hr>
 
 After following above steps successfully, run the below commands - <br><br>
  npm i (install required packages)<br>
  nodemon server.js (start server)<br>
  
  open - http://localhost:5001 on your browser.

<h1>To Make Video Call Feature Working, Jitsi is required</h2>

  Github - https://github.com/jitsi/jitsi-meet (Clone this repo)
  Developer Guide - https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-web (Follow guide for advance features)
  
  Follow below steps to run Jitsi on your machine -
  
   Step 1 - Clone the repository from the above Github url<br>
   Step 2 - Install required dependencies using command - <strong>npm install</strong><br>
   Step 3 - Start Jitsi server using - <strong>make dev</strong>
   
  Server will be succesfully started on https://localhost:8080 
