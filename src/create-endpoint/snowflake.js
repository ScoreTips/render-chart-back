class Snowflake {
    constructor(workerId = 1, datacenterId = 1) {
        this.epoch = 1288834974657n; // Twitter Epoch, em milissegundos
        this.workerId = BigInt(workerId);
        this.datacenterId = BigInt(datacenterId);
        this.sequence = 0n;

        // Shift values para diferentes partes do ID
        this.workerIdShift = 12n;
        this.datacenterIdShift = 17n;
        this.timestampShift = 22n;

        this.maxWorkerId = 31n;
        this.maxDatacenterId = 31n;
        this.maxSequence = 4095n;

        this.lastTimestamp = -1n;
    }

    // Gera o próximo Snowflake ID
    generate() {
        let timestamp = this.currentTime();

        // Se o timestamp é igual ao último, aumenta a sequência
        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & this.maxSequence;

            if (this.sequence === 0n) {
                timestamp = this.waitForNextMillis(this.lastTimestamp);
            }
        } else {
            this.sequence = 0n;
        }

        this.lastTimestamp = timestamp;

        return (
            ((timestamp - this.epoch) << this.timestampShift) |
            (this.datacenterId << this.datacenterIdShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence
        ).toString();
    }

    // Espera até o próximo milissegundo se o timestamp for igual ao último
    waitForNextMillis(lastTimestamp) {
        let timestamp = this.currentTime();
        while (timestamp === lastTimestamp) {
            timestamp = this.currentTime();
        }
        return timestamp;
    }

    // Obtém o timestamp atual em milissegundos
    currentTime() {
        return BigInt(Date.now());
    }
}

module.exports = Snowflake;