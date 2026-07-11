// Crowd sound integration
const crowdAudio = new Audio('./assets/crowd-cheer.mp3');

function playLoginSound(){
  crowdAudio.currentTime = 0;
  crowdAudio.play().catch(()=>{});
}

// Call playLoginSound() immediately after successful login.
