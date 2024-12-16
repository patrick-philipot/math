function setupAudio() {

    // background music
    const musicAudio = new Howl({
      src: ['./xenon2.mp3'],
      autoplay: true,
      loop: true,
    });

    musicAudio.play();
  
  }