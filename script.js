document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen and show main content after maintenance is over
    // For now, keep it hidden
    // setTimeout(function() {
    //     document.getElementById('loading-screen').style.display = 'none';
    //     document.getElementById('main-content').style.display = 'block';
    // }, 5000); // Uncomment this to show main content after 5 seconds

    // Handle audio playback
    const audio = document.getElementById('maintenanceAudio');
    audio.volume = 0.5; // Adjust volume as needed
});
