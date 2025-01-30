document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioFileInput = document.getElementById('audioFileInput');
    const waveformCanvas = document.getElementById('waveformCanvas');
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    let sourceNode = null;

    audioFileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                drawWaveform(buffer);
                setupAudioPlayback(buffer);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function drawWaveform(audioBuffer) {
        const canvas = waveformCanvas;
        const canvasCtx = canvas.getContext('2d');
        const data = audioBuffer.getChannelData(0); // Get the left channel data
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i++) {
            const minVal = 1.0;
            const maxVal = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < minVal) minVal = datum;
                if (datum > maxVal) maxVal = datum;
            }
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(i, (1 + minVal) * amp, 1, Math.max(1, (maxVal - minVal) * amp));
        }
    }

    function setupAudioPlayback(audioBuffer) {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
        }

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);

        playButton.addEventListener('click', () => {
            sourceNode.start(0);
        });

        pauseButton.addEventListener('click', () => {
            sourceNode.stop();
        });
    }
});