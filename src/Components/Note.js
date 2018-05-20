import {rgb2hsl, hsl2rgb} from '@/utils'

export default class Note
{
    constructor (startTime = 0, noteName = "", noteNo = 0, velocity = 0, duration = 0, active = true,
                 velocityStart = 0, receivedNoteOff = false, channel = 0) {
        this.startTime = startTime;
        this.noteName = noteName;
        this.noteNo = noteNo;
        this.velocity = velocity;
        this.velocityStart = velocityStart;
        this.duration = duration;
        this.active = active;
        this.receivedNoteOff = receivedNoteOff;
        this.channel = channel;
    }

    static atackCurve = x => 1 - ((1 - x) ** 2)
    static releaseCurve = x => (1 - x * x);
    static noteOffRelaseDuration = 500;
    static noteNameString = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    static infoCache = {};

    noteOn(noteName, noteNo, velocity, duration = 500, channel = 0) {
        this.startTime = new Date().getTime();
        this.noteName = noteName;
        this.noteNo = noteNo;
        this.velocity = velocity;
        this.velocityStart = velocity;
        this.duration = duration;
        this.active = true;
        this.channel = channel;

        this.tick();
    }

    noteOff() {
        let time = new Date().getTime();
        let elapsedTime = time - this.startTime;
        let remainingTime = this.duration - elapsedTime;

        if (remainingTime > Note.noteOffRelaseDuration) {
            this.duration = Note.noteOffRelaseDuration;
            this.startTime = time;
            this.velocityStart = this.velocity;
            this.receivedNoteOff = true;
        }
        this.tick();
    }

    tick() {
        let time = new Date().getTime();
        let elapsedTime = time - this.startTime;
        let amout = elapsedTime / this.duration;
        amout = Math.max(0.0, amout);
        amout = Math.min(1.0, amout);

        let y = 1;
        let releasePhase = false;
        if (this.receivedNoteOff) {
            y = Note.releaseCurve(amout);
            releasePhase = true;
        } else {
            if (amout <= 0.6) {//atack
                y = Note.atackCurve(amout / 0.5);
            } else if (amout >= 0.6) {
                y = Note.releaseCurve(amout);
                releasePhase = true;
            }
        }
        
        let nextVelocity = this.velocityStart * y;
        if (nextVelocity < 0.001 && releasePhase) {
            nextVelocity = 0;
            this.active = false;
        }
        this.velocity = nextVelocity;
    }

    noteInfo() {        
        let info = Note.noteInfo(this.noteNo);
        return info;
    }

    static noteInfo(noteNo) {
        if (Note.infoCache[noteNo]){
            return Note.infoCache[noteNo];
        }
        let freq = 440 * 2 ** ((noteNo - 69) / 12);
        let octave = Math.floor(noteNo / 12) - 1;
        let pitchNo = parseInt(noteNo) % 12;
        let pitchName = Note.noteNameString[pitchNo];
        let noteName = pitchName + octave;

        let octave2 = octave;
        octave2 = Math.max(2, octave);
        octave2 = Math.min(8, octave);//2 - 8
        octave2 -= 2;//0 to 6(7 step).
        octave2 = parseFloat(octave2) / 7.0;//0 to 1;
        octave2 = octave2 * 0.8 + 0.1;//0.1 to 0.8
        
        let hsl = rgb2hsl(1, 0, 0);
        hsl[0] = parseFloat(pitchNo) / 12.0 * 360;
        hsl[2] = octave2;
        let rgb = hsl2rgb(hsl[0], hsl[1], hsl[2]);

        let info = {noteNo, freq, octave, pitchNo, pitchName, noteName, octave2, hsl, rgb};
        Note.infoCache[noteNo] = info;
        return info;
    }
}