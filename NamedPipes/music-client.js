// music-client.js
const net = require('net');
const readline = require('readline');

const PIPE_NAME = process.platform === 'win32' 
  ? '\\\\.\\pipe\\music-pipe' 
  : '/tmp/music-pipe';

const RETRY_DELAY = 2000; // 2 sekundi
const MAX_RETRIES = 5;

let client = null;
let isConnected = false;
let retryCount = 0;
let responseBuffer = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎵 Music Client starting...');
console.log(`📍 Connecting to: ${PIPE_NAME}`);

function connectToServer() {
  if (retryCount >= MAX_RETRIES) {
    console.error('❌ Failed to connect after multiple attempts. Please ensure the server is running.');
    process.exit(1);
  }

  client = net.connect(PIPE_NAME, () => {
    console.log('✅ Connected to Music Server!');
    isConnected = true;
    retryCount = 0;
    showMenu();
  });

  client.on('data', (data) => {
    responseBuffer += data.toString();
    const lines = responseBuffer.split('\n');
    responseBuffer = lines.pop(); // Ohrani nepopolno vrstico
    
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          displayResponse(response);
        } catch (err) {
          console.error('Error parsing response:', err.message);
        }
        showPrompt();
      }
    });
  });

  client.on('error', (err) => {
    if (!isConnected) {
      retryCount++;
      console.log(`⏳ Server not available. Retrying in ${RETRY_DELAY/1000}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectToServer, RETRY_DELAY);
    } else {
      console.error('Connection error:', err.message);
      isConnected = false;
      process.exit(1);
    }
  });

  client.on('end', () => {
    console.log('❌ Disconnected from server');
    isConnected = false;
    process.exit(0);
  });
}

function showMenu() {
  console.log('\n═══════════════════════════════════════');
  console.log('🎼 MUSIC APPLICATION - MAIN MENU');
  console.log('═══════════════════════════════════════');
  console.log('1. 🎵 Get Song by ID');
  console.log('2. 🔍 Search Songs');
  console.log('3. 📋 Get Playlist');
  console.log('4. 📊 Get Statistics');
  console.log('5. ➕ Add Song to Playlist');
  console.log('6. 💡 Get Recommendations by Genre');
  console.log('7. 📖 Show Menu');
  console.log('8. 🚪 Exit');
  console.log('═══════════════════════════════════════\n');
  showPrompt();
}

function showPrompt() {
  rl.question('Choose option (1-8): ', handleUserInput);
}

function handleUserInput(choice) {
  if (!isConnected) {
    console.log('❌ Not connected to server. Please wait...');
    setTimeout(showPrompt, 1000);
    return;
  }

  switch (choice.trim()) {
    case '1':
      rl.question('Enter Song ID (1-5): ', (id) => {
        sendRequest({ action: 'GET_SONG', songId: parseInt(id) });
      });
      break;
    
    case '2':
      rl.question('Enter search query: ', (query) => {
        sendRequest({ action: 'SEARCH_SONGS', query });
      });
      break;
    
    case '3':
      rl.question('Enter Playlist ID (1-2): ', (id) => {
        sendRequest({ action: 'GET_PLAYLIST', playlistId: parseInt(id) });
      });
      break;
    
    case '4':
      sendRequest({ action: 'GET_STATS' });
      break;
    
    case '5':
      rl.question('Enter Playlist ID: ', (playlistId) => {
        rl.question('Enter Song ID: ', (songId) => {
          sendRequest({ 
            action: 'ADD_TO_PLAYLIST', 
            playlistId: parseInt(playlistId),
            songId: parseInt(songId)
          });
        });
      });
      break;
    
    case '6':
      rl.question('Enter Genre (Rock/Pop/Grunge): ', (genre) => {
        sendRequest({ action: 'GET_RECOMMENDATIONS', genre });
      });
      break;
    
    case '7':
      showMenu();
      break;
    
    case '8':
      console.log('👋 Goodbye!');
      client.end();
      rl.close();
      process.exit(0);
      break;
    
    default:
      console.log('❌ Invalid option. Please choose 1-8.');
      showPrompt();
  }
}

function sendRequest(request) {
  try {
    const message = JSON.stringify(request) + '\n';
    client.write(message);
    console.log('📤 Request sent...');
  } catch (err) {
    console.error('Error sending request:', err.message);
    showPrompt();
  }
}

function displayResponse(response) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 SERVER RESPONSE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (response.error) {
    console.log(`❌ Error: ${response.error}`);
    if (response.details) console.log(`   Details: ${response.details}`);
  } else if (response.success) {
    if (response.song) {
      displaySong(response.song);
    } else if (response.results) {
      console.log(`\n🔍 Found ${response.count} song(s):\n`);
      response.results.forEach((song, idx) => {
        console.log(`${idx + 1}. ${song.title} - ${song.artist}`);
        console.log(`   Album: ${song.album} (${song.year})`);
        console.log(`   Genre: ${song.genre} | Duration: ${formatDuration(song.duration)}\n`);
      });
    } else if (response.playlist) {
      displayPlaylist(response.playlist);
    } else if (response.stats) {
      displayStats(response.stats);
    } else if (response.recommendations) {
      console.log(`\n💡 Found ${response.count} recommendation(s):\n`);
      response.recommendations.forEach((song, idx) => {
        console.log(`${idx + 1}. ${song.title} - ${song.artist}`);
        console.log(`   ${song.album} (${song.year})\n`);
      });
    } else if (response.message) {
      console.log(`✅ ${response.message}`);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function displaySong(song) {
  console.log('\n🎵 SONG DETAILS:');
  console.log(`   Title:    ${song.title}`);
  console.log(`   Artist:   ${song.artist}`);
  console.log(`   Album:    ${song.album}`);
  console.log(`   Year:     ${song.year}`);
  console.log(`   Genre:    ${song.genre}`);
  console.log(`   Duration: ${formatDuration(song.duration)}`);
}

function displayPlaylist(playlist) {
  console.log(`\n📋 PLAYLIST: ${playlist.name}`);
  console.log(`   Songs in playlist: ${playlist.songs.length}\n`);
  playlist.songs.forEach((song, idx) => {
    console.log(`   ${idx + 1}. ${song.title} - ${song.artist}`);
    console.log(`      ${formatDuration(song.duration)}\n`);
  });
}

function displayStats(stats) {
  console.log('\n📊 MUSIC STATISTICS:');
  console.log(`   Total Plays:   ${stats.totalPlays.toLocaleString()}`);
  console.log(`   Active Users:  ${stats.activeUsers.toLocaleString()}`);
  console.log(`   Top Genre:     ${stats.topGenre}`);
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down client...');
  if (client) client.end();
  rl.close();
  process.exit(0);
});

// Start connection
connectToServer();