// Test the encoding function
function encodeByteArrayForCallData(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    const dataArray = [];
    let pendingWord = '0x0';
    let pendingWordLen = 0;

    // Process bytes in chunks of 31 (bytes31 size)
    let offset = 0;
    while (offset < bytes.length) {
        const chunkSize = Math.min(31, bytes.length - offset);

        if (chunkSize === 31) {
            // Full chunk - add to data array
            const chunk = bytes.slice(offset, offset + 31);
            const bytes31 = new Uint8Array(31);
            bytes31.set(chunk);
            const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');
            dataArray.push(dataFelt);
            offset += 31;
        } else {
            // Partial chunk - this becomes the pending word
            const chunk = bytes.slice(offset);
            const hexString = '0x' + Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(62, '0'); // Pad to 31 bytes
            pendingWord = hexString;
            pendingWordLen = chunk.length;
            break;
        }
    }

    return {
        data: dataArray,
        pending_word: pendingWord,
        pending_word_len: pendingWordLen.toString()
    };
}

// Test with a typical Pinata URL
const testUrl = "https://gateway.pinata.cloud/ipfs/bafkreiel2g7cmu55rgm2zzyvm7hiz42z4eyhy3chryxbbyucf27dp6dp3e";
console.log('Test URL:', testUrl);
console.log('URL length:', testUrl.length);

const encoded = encodeByteArrayForCallData(testUrl);
console.log('\nEncoded result:');
console.log('Data array length:', encoded.data.length);
console.log('Data array:', encoded.data);
console.log('Pending word:', encoded.pending_word);
console.log('Pending word len:', encoded.pending_word_len);

// Show what each data chunk decodes to
console.log('\nData chunks decoded:');
encoded.data.forEach((data, index) => {
    const hex = data.replace('0x', '');
    const decoded = Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
    console.log(`Chunk ${index + 1}:`, decoded);
});

if (encoded.pending_word !== '0x0') {
    const pendingHex = encoded.pending_word.replace('0x', '');
    const pendingBytes = pendingHex.slice(0, parseInt(encoded.pending_word_len) * 2);
    const pendingDecoded = Buffer.from(pendingBytes, 'hex').toString('utf8');
    console.log('Pending word decoded:', pendingDecoded);
}

// Create the manual calldata array (without recipient)
const calldata = [
    encoded.data.length.toString(),  // ByteArray data length
    ...encoded.data,  // ByteArray data elements  
    encoded.pending_word,  // ByteArray pending word
    encoded.pending_word_len  // ByteArray pending word length
];

console.log('\nCalldata array (without recipient):');
console.log(calldata);
