document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen and show main content after 2 seconds
    setTimeout(function() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 2000);

    const form = document.getElementById('wellnessForm');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const wellnessData = Object.fromEntries(formData);

        // Send data to your backend or process it locally
        console.log(wellnessData);

        // Example: Send data to backend
        fetch('/processData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wellnessData)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    });
});
