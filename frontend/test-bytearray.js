// Test ByteArray parsing - NEW RESPONSE
const testResult = ["0x4", "0x68747470733a2f2f676174657761792e70696e6174612e636c6f75642f6970", "0x0", "0x0", "0x0", "0x0", "0x0"];

function parseByteArray(result) {
    try {
        console.log('Parsing ByteArray result:', result);

        if (Array.isArray(result) && result.length >= 2) {
            const dataLen = parseInt(result[0]);
            let fullString = '';

            console.log('Data length:', dataLen);

            // Extract data elements (skip first element which is length)
            for (let i = 1; i <= dataLen; i++) {
                if (result[i] && result[i] !== '0x0') {
                    const hexString = result[i].replace('0x', '');
                    console.log(`Data ${i} hex:`, hexString);
                    const decodedPart = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
                    console.log(`Data ${i} decoded:`, decodedPart);
                    fullString += decodedPart;
                }
            }

            console.log('String so far:', fullString);

            // The pending word should be right after the data array
            // In this format: [data_len, data1, data2, data3, data4, pending_word, pending_word_len]
            const pendingWordIndex = dataLen + 1; // Should be index 5
            const pendingWordLenIndex = result.length - 1; // Should be index 6

            console.log('Pending word index:', pendingWordIndex);
            console.log('Pending word value:', result[pendingWordIndex]);
            console.log('Pending word len index:', pendingWordLenIndex);
            console.log('Pending word len value:', result[pendingWordLenIndex]);

            if (result[pendingWordLenIndex] && parseInt(result[pendingWordLenIndex]) > 0) {
                const pendingWordLen = parseInt(result[pendingWordLenIndex]);
                console.log('Pending word length:', pendingWordLen);

                if (result[pendingWordIndex] && result[pendingWordIndex] !== '0x0') {
                    const pendingHex = result[pendingWordIndex].replace('0x', '');
                    console.log('Pending word hex:', pendingHex);
                    // Only take the specified number of bytes from the pending word
                    const pendingBytes = pendingHex.slice(0, pendingWordLen * 2); // 2 hex chars per byte
                    console.log('Pending bytes:', pendingBytes);
                    if (pendingBytes) {
                        const pendingString = Buffer.from(pendingBytes, 'hex').toString('utf8');
                        console.log('Pending string:', pendingString);
                        fullString += pendingString;
                    }
                } else {
                    console.log('ERROR: Pending word is 0x0 but pending_word_len is', pendingWordLen);
                    console.log('This indicates the string was truncated during encoding!');
                }
            }

            console.log('Final parsed result:', fullString);
            return fullString.trim();
        }

        return 'Unknown';
    } catch (e) {
        console.warn('Error parsing ByteArray:', e);
        return 'Unknown';
    }
}

const result = parseByteArray(testResult);
console.log('Final result:', result);

// Let's also test what the full URL should encode to
console.log('\n--- Testing full URL encoding ---');
const fullUrl = "https://azure-electric-parakeet-827.mypinata.cloud/ipfs/bafkreiel2g7cmu55rgm2zzyvm7hiz42z4eyhy3chryxbbyucf27dp6dp3e";
console.log('Full URL:', fullUrl);
console.log('Full URL length:', fullUrl.length);

const encoder = new TextEncoder();
const bytes = encoder.encode(fullUrl);
console.log('Encoded bytes length:', bytes.length);

// Simulate proper encoding
const dataArray = [];
let pendingWord = '0x0';
let pendingWordLen = 0;

let offset = 0;
while (offset < bytes.length) {
    const chunkSize = Math.min(31, bytes.length - offset);

    if (chunkSize === 31) {
        const chunk = bytes.slice(offset, offset + 31);
        const bytes31 = new Uint8Array(31);
        bytes31.set(chunk);
        const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');
        dataArray.push(dataFelt);
        console.log(`Data chunk ${dataArray.length}:`, Buffer.from(chunk).toString('utf8'));
        offset += 31;
    } else {
        const chunk = bytes.slice(offset);
        const hexString = '0x' + Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(62, '0');
        pendingWord = hexString;
        pendingWordLen = chunk.length;
        console.log('Pending word chunk:', Buffer.from(chunk).toString('utf8'));
        break;
    }
}

console.log('Proper encoding would be:');
console.log('Data array length:', dataArray.length);
console.log('Data array:', dataArray);
console.log('Pending word:', pendingWord);
console.log('Pending word len:', pendingWordLen);
