/**
 * Fichier JPEG = { SECTIONS }
 *  
 * SECTION = MARKER(2) + [ SECTION DATA ] 
 * SECTION DATA = [ SECTION DATA LENGTH IN OCTET ](2) + DATA
 * 
 * Donnees d'une section limité à 0xFFFF - 2 soit 65533 octets 
 * 
 * FFD8 FFE1 LLLL data......data (FFXX LLLL data...... data)xN FFD9
 * SOI  APP1 Long Données EXIF         N autres sections       EOI
 *      [ ----Section EXIF-----]
 * 
 * Parmi les sections, on retiendra :
 * 
 * - la table de quantification, 
 * - la table d’Huffman
 *  - et l’image proprement dite, qui suit le marqueur SOS 
 * 
 * Le format EXIF utilise utilise la norme TIFF (Tagged Image File Format) afin de structurer sa section.
 * EXIF SECTION = { IFD }, IFD = Image File Directory, donc la section est un ensemble de répertoires
 * IFD = [ NUMBER OF ENTRIES ](2) { ENTRY }, chaque ENTRY (12 octets) est identifié par un TAG correspondant à la signification du champ.
 * ENTRY =  tg tg   ft ft    ct ct ct ct     vo vo vo vo      (2)  (2)   (4)  (4) 
 *         Tag-Id  Format  [-- Count ---]  Value / Offset
 */

var JPEG_MARKERS = {
    0xFFD8 : [ 'SOI', 'Start Of Image' ],
    
    // Appplication markers APP0 (0xFFE0) --> APP15 (0xFFEF) 
    0xFFE0 : [ 'APP0', 'JFIF format', 'Jpeg File Interchange Format' ],
    0xFFE1 : [ 'APP1', 'EXIF format', 'EXchangeable Image file Format' ],
    0xFFE2 : [ 'APP2' ],
    0xFFE3 : [ 'APP3' ],
    0xFFE4 : [ 'APP4' ],
    0xFFE5 : [ 'APP5' ],
    0xFFE6 : [ 'APP6' ],
    0xFFE7 : [ 'APP7' ],
    0xFFE8 : [ 'APP8' ],
    0xFFE9 : [ 'APP9' ],
    0xFFEA : [ 'APP10' ],
    0xFFEB : [ 'APP11' ],
    0xFFEC : [ 'APP12' ],
    0xFFED : [ 'APP13' ],
    0xFFEE : [ 'APP14' ],
    0xFFEF : [ 'APP15' ],
    
    0xFFDA: [ 'SOS', 'Start Of Scan (debut des donnees)' ],
    0xFFD9: [ 'EOI', 'End Of Image' ]
};

IFD0_TAGS = {
    0x00FE : [ 'NewSubfileType', 'A general indication of the kind of data contained in this subfile' ],
    0x00FF : [ 'SubfileType', 'A general indication of the kind of data contained in this subfile' ],
    0x0100 : [ 'ImageWidth', 'The number of columns in the image, i.e., the number of pixels per row' ],
    0x0101 : [ 'ImageHeight', 'The number of rows of pixels in the image' ],
    0x0102 : [ 'BitsPerSample', 'Number of bits per component' ],
    0x0103 : [ 'Compression', 'Compression scheme used on the image data' ],
    0x0106 : [ 'PhotometricInterpretation', 'The color space of the image data' ],
    0x0107 : [ 'Threshholding', 'For black and white TIFF files that represent shades of gray, the technique used to convert from gray to black and white pixels' ],
    0x0108 : [ 'CellWidth', 'The width of the dithering or halftoning matrix used to create a dithered or halftoned bilevel file' ],
    0x0109 : [ 'CellLength', 'The length of the dithering or halftoning matrix used to create a dithered or halftoned bilevel file' ],
    0x010A : [ 'FillOrder', 'The logical order of bits within a byte' ],
    0x010E : [ 'ImageDescription', 'A string that describes the subject of the image' ],
    0x010F : [ 'Make', 'The scanner manufacturer' ],
    0x0110 : [ 'Model', 'The scanner model name or number' ],
    0x0111 : [ 'StripOffsets', 'For each strip, the byte offset of that strip' ],
    0x0112 : [ 'Orientation', 'The orientation of the image with respect to the rows and columns' ],
    0x0115 : [ 'SamplesPerPixel', 'The number of components per pixel' ],
    0x0116 : [ 'RowsPerStrip', 'The number of rows per strip' ],
    0x0117 : [ 'StripByteCounts', 'For each strip, the number of bytes in the strip after compression' ],
    0x0118 : [ 'MinSampleValue', 'The minimum component value used' ],
    0x0119 : [ 'MaxSampleValue', 'The maximum component value used' ],
    0x011A : [ 'XResolution', 'The number of pixels per ResolutionUnit in the ImageWidth direction' ],
    0x011B : [ 'YResolution', 'The number of pixels per ResolutionUnit in the ImageLength direction' ],
    0x011C : [ 'PlanarConfiguration', 'How the components of each pixel are stored' ],
    0x0120 : [ 'FreeOffsets', 'For each string of contiguous unused bytes in a TIFF file, the byte offset of the string' ],
    0x0121 : [ 'FreeByteCounts', 'For each string of contiguous unused bytes in a TIFF file, the number of bytes in the string' ],
    0x0122 : [ 'GrayResponseUnit', 'The precision of the information contained in the GrayResponseCurve' ],
    0x0123 : [ 'GrayResponseCurve', 'For grayscale data, the optical density of each possible pixel value' ],
    0x0128 : [ 'ResolutionUnit', 'The unit of measurement for XResolution and YResolution' ],
    0x0131 : [ 'Software', 'Name and version number of the software package(s) used to create the image' ],
    0x0132 : [ 'DateTime', 'Date and time of image creation' ],
    0x013B : [ 'Artist', 'Person who created the image' ],
    0x013C : [ 'HostComputer', 'The computer and/or operating system in use at the time of image creation' ],
    0x0140 : [ 'ColorMap', 'A color map for palette color images' ],
    0x0152 : [ 'ExtraSamples', 'Description of extra components' ],
    0x0213 : [ 'YCbCrPositioning', 'Specifies the positioning of subsampled chrominance components relative to luminance samples' ],
    0x8298 : [ 'Copyright', 'Copyright notice' ],
    0x8769 : [ "ExifIFDPointer" ],
    0x8825 : [ "GPSInfoIFDPointer" ]
};

IFD1_TAGS = {
    0x0100: [ "ImageWidth" ],
    0x0101: [ "ImageHeight" ],
    0x0102: [ "BitsPerSample" ],
    0x0103: [ "Compression" ],
    0x0106: [ "PhotometricInterpretation" ],
    0x0111: [ "StripOffsets" ],
    0x0112: [ "Orientation" ],
    0x0115: [ "SamplesPerPixel" ],
    0x0116: [ "RowsPerStrip" ],
    0x0117: [ "StripByteCounts" ],
    0x011A: [ "XResolution" ],
    0x011B: [ "YResolution" ],
    0x011C: [ "PlanarConfiguration" ],
    0x0128: [ "ResolutionUnit" ],
    0x0201: [ "JpegIFOffset" ],    // When image format is JPEG, this value show offset to JPEG data stored.(aka "ThumbnailOffset" or "JPEGInterchangeFormat")
    0x0202: [ "JpegIFByteCount" ], // When image format is JPEG, this value shows data size of JPEG image (aka "ThumbnailLength" or "JPEGInterchangeFormatLength")
    0x0211: [ "YCbCrCoefficients" ],
    0x0212: [ "YCbCrSubSampling" ],
    0x0213: [ "YCbCrPositioning" ],
    0x0214: [ "ReferenceBlackWhite" ]
};

var EXIF_TAGS = {
    // version tags
    0x9000 : [ "ExifVersion", "EXIF version" ],
    0xA000 : [ "FlashpixVersion", "Flashpix format version" ],

    // colorspace tags
    0xA001 : [ "ColorSpace", "Color space information tag" ],
    
    // image configuration
    0xA002 : [ "PixelXDimension", "Valid width of meaningful image" ],
    0xA003 : [ "PixelYDimension", "Valid height of meaningful image" ],
    0x9101 : [ "ComponentsConfiguration", "Information about channels" ],
    0x9102 : [ "CompressedBitsPerPixel", "Compressed bits per pixel" ],

    // user information
    0x927C : [ "MakerNote", "Any desired information written by the manufacturer" ],
    0x9286 : [ "UserComment", "Comments by user" ],

    // related file
    0xA004 : [ "RelatedSoundFile", "Name of related sound file" ],

    // date and time
    0x9003 : [ "DateTimeOriginal", "Date and time when the original image was generated" ],
    0x9004 : [ "DateTimeDigitized", "Date and time when the image was stored digitally" ],
    0x9290 : [ "SubsecTime", "Fractions of seconds for DateTime" ],
    0x9291 : [ "SubsecTimeOriginal", "Fractions of seconds for DateTimeOriginal" ],
    0x9292 : [ "SubsecTimeDigitized", "Fractions of seconds for DateTimeDigitized" ],

    // picture-taking conditions
    0x829A : [ "ExposureTime", "Exposure time (in seconds)" ],
    0x829D : [ "FNumber", "F number" ],
    0x8822 : [ "ExposureProgram", "Exposure program" ],
    0x8824 : [ "SpectralSensitivity", "Spectral sensitivity" ],
    0x8827 : [ "ISOSpeedRatings", "ISO speed rating" ],
    0x8828 : [ "OECF", "Optoelectric conversion factor" ],
    0x9201 : [ "ShutterSpeedValue", "Shutter speed" ],
    0x9202 : [ "ApertureValue", "Lens aperture" ],
    0x9203 : [ "BrightnessValue", "Value of brightness" ],
    0x9204 : [ "ExposureBias", "Exposure bias" ],
    0x9205 : [ "MaxApertureValue", "Smallest F number of lens" ],
    0x9206 : [ "SubjectDistance", "Distance to subject in meters" ],
    0x9207 : [ "MeteringMode", "Metering mode" ],
    0x9208 : [ "LightSource", "Kind of light source" ],
    0x9209 : [ "Flash" ],
    0x9214 : [ "SubjectArea", "Location and area of main subject" ],
    0x920A : [ "FocalLength", "Focal length of the lens in mm" ],
    0xA20B : [ "FlashEnergy", "Strobe energy in BCPS" ],
    0xA20C : [ "SpatialFrequencyResponse" ],
    0xA20E : [ "FocalPlaneXResolution", "Number of pixels in width direction per FocalPlaneResolutionUnit" ],
    0xA20F : [ "FocalPlaneYResolution", "Number of pixels in height direction per FocalPlaneResolutionUnit" ],
    0xA210 : [ "FocalPlaneResolutionUnit", "Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution" ],
    0xA214 : [ "SubjectLocation", "Location of subject in image" ],
    0xA215 : [ "ExposureIndex", "Exposure index selected on camera" ],
    0xA217 : [ "SensingMethod", "Image sensor type" ],
    0xA300 : [ "FileSource", "Image source (3 == DSC)" ],
    0xA301 : [ "SceneType", "Scene type (1 == directly photographed)" ],
    0xA302 : [ "CFAPattern", "Color filter array geometric pattern" ],
    0xA401 : [ "CustomRendered", "Special processing" ],
    0xA402 : [ "ExposureMode", "Exposure mode" ],
    0xA403 : [ "WhiteBalance", "1 = auto white balance, 2 = manual" ],
    0xA404 : [ "DigitalZoomRation", "Digital zoom ratio" ],
    0xA405 : [ "FocalLengthIn35mmFilm", "Equivalent foacl length assuming 35mm film camera (in mm)" ],
    0xA406 : [ "SceneCaptureType", "Type of scene" ],
    0xA407 : [ "GainControl", "Degree of overall image gain adjustment" ],
    0xA408 : [ "Contrast", "Direction of contrast processing applied by camera" ],
    0xA409 : [ "Saturation", "Direction of saturation processing applied by camera" ],
    0xA40A : [ "Sharpness", "Direction of sharpness processing applied by camera" ],
    0xA40B : [ "DeviceSettingDescription" ],
    0xA40C : [ "SubjectDistanceRange", "Distance to subject" ],

    // other tags
    0xA005 : [ "InteroperabilityIFDPointer" ],
    0xA420 : [ "ImageUniqueID", "Identifier assigned uniquely to each image "]
};

var GPS_TAGS = {
    0x0000 : [ "GPSVersionID" ],
    0x0001 : [ "GPSLatitudeRef" ],
    0x0002 : [ "GPSLatitude" ],
    0x0003 : [ "GPSLongitudeRef" ],
    0x0004 : [ "GPSLongitude" ],
    0x0005 : [ "GPSAltitudeRef" ],
    0x0006 : [ "GPSAltitude" ],
    0x0007 : [ "GPSTimeStamp" ],
    0x0008 : [ "GPSSatellites" ],
    0x0009 : [ "GPSStatus" ],
    0x000A : [ "GPSMeasureMode" ],
    0x000B : [ "GPSDOP" ],
    0x000C : [ "GPSSpeedRef" ],
    0x000D : [ "GPSSpeed" ],
    0x000E : [ "GPSTrackRef" ],
    0x000F : [ "GPSTrack" ],
    0x0010 : [ "GPSImgDirectionRef" ],
    0x0011 : [ "GPSImgDirection" ],
    0x0012 : [ "GPSMapDatum" ],
    0x0013 : [ "GPSDestLatitudeRef" ],
    0x0014 : [ "GPSDestLatitude" ],
    0x0015 : [ "GPSDestLongitudeRef" ],
    0x0016 : [ "GPSDestLongitude" ],
    0x0017 : [ "GPSDestBearingRef" ],
    0x0018 : [ "GPSDestBearing" ],
    0x0019 : [ "GPSDestDistanceRef" ],
    0x001A : [ "GPSDestDistance" ],
    0x001B : [ "GPSProcessingMethod" ],
    0x001C : [ "GPSAreaInformation" ],
    0x001D : [ "GPSDateStamp" ],
    0x001E : [ "GPSDifferential" ]
};

export default class ImageReader {
    readAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            let fr = new FileReader();

            fr.onload = (e) => {
                resolve(e.target.result);
            };

            fr.readAsArrayBuffer(file);
        });
    }

    readAsBinaryString(file) {
        return new Promise((resolve, reject) => {
            let fr = new FileReader();

            fr.onload = (e) => {
                resolve(e.target.result);
            };

            fr.readAsBinaryString(file);
        });
    }

    readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            let fr = new FileReader();

            fr.onload = (e) => {
                resolve(e.target.result);
            };

            fr.readAsDataURL(file);
        });
    }

    getExif(view) {
        let soi = view.getUint16(0);
        
        // check the start code SOI
        if (0xFFD8 !== soi)
            return null;

        let length = view.byteLength; 
        let offset = 2;

        // browse the arraybuffer
        while (offset < length)
        {
            // invalid JPEG
            if (0xFF !== view.getUint8(offset))
                return null;
            
            let marker = view.getUint8(offset + 1);
            let markerLength = view.getUint16(offset + 2);

            if (0xe1 === marker)
                return this.readExif(view, offset + 4);
            else
                offset += 2 + markerLength;     // jump to the next marker
        }
    }

    getXMP(view) {
        let soi = view.getUint16(0);
        
        // check the start code SOI
        if (0xFFD8 !== soi)
            return null;

        let length = view.byteLength; 
        let offset = 2;

        // browse the arraybuffer
        while (offset < length)
        {
            // invalid JPEG or SOS
            if (0xFF !== view.getUint8(offset) || 0xd9 === view.getUint8(offset + 1))
                return null;
            
            let marker = view.getUint8(offset + 1);
            let markerLength = view.getUint16(offset + 2);

            if (0xe1 === marker)
            {
                let str = this.stringify(view, offset + 4, 4);
                
                if ('http' === str)            
                    return this.stringify(view, offset + 4, markerLength - 2);

                offset += 2 + markerLength;
            }
            else
                offset += 2 + markerLength;     // jump to the next marker
        }
    }

    getTiffOffsetInfo(view) {
        let soi = view.getUint16(0);
        
        // check the start code SOI
        if (0xFFD8 !== soi)
            return null;

        let length = view.byteLength; 
        let offset = 2;

        // browse the arraybuffer
        while (offset < length)
        {
            // invalid JPEG
            if (0xFF !== view.getUint8(offset))
                return null;
            
            let marker = view.getUint8(offset + 1);

            if (0xe1 === marker)
            {
                let section_offset = offset + 4;
                /*
                * La section EXIF commence toujours par Exif00 (sur 6 octets)  
                * 45 78 69 66 00 00
                * E  x  i  f  0  0
                */

                let str = this.stringify(view, section_offset, 4);

                // Not a valid exif
                if ('Exif' !== str) 
                    return null;
                
                str = this.stringify(view, section_offset + 6, 2);

                // Not a valid exif
                if (-1 === [ 'MM', 'II' ].indexOf(str))
                    return null;

                let littleEndian = 'II' === str;
                
                // verification de l'alignement 00 2A pour bigEndian et 2A 00 pour littleEndian
                if (littleEndian && 0x2A00 !== view.getUint16(section_offset + 8))
                    return null;

                return { tiffOffset : section_offset + 6, littleEndian: littleEndian };
            }    
            else
                offset += 2 + markerLength;     // jump to the next marker
        }

        return null;
    }

    getThumbnail(view) {
        let { tiffOffset, littleEndian } = this.getTiffOffsetInfo(view);
        let thumbnail_tags = {};
        
        if (tiffOffset)
        {
            let IFD0_offset = view.getUint32(tiffOffset + 4, littleEndian);
            let entries = view.getUint16(tiffOffset + IFD0_offset, littleEndian);
            let IFD1_offset = view.getUint32(tiffOffset + IFD0_offset + 2 + 12 * entries, littleEndian);

            if (IFD1_offset && IFD1_offset < view.byteLength)
            {
                thumbnail_tags = this.readTags(view, tiffOffset, tiffOffset + IFD1_offset, littleEndian, IFD1_TAGS);
                
                if (6 === thumbnail_tags.Compression)
                {
                    if (thumbnail_tags.JpegIFOffset && thumbnail_tags.JpegIFByteCount) 
                    {
                        let offset = tiffOffset + thumbnail_tags.JpegIFOffset;
                        let length = thumbnail_tags.JpegIFByteCount;

                        thumbnail_tags.blob = new Blob([
                            new Uint8Array(view.buffer, offset, length)
                        ],{ type: 'image/jpeg' });
                    }
                }
            }                
        }
        
        return thumbnail_tags;
    }

    stringify(view, start, length) {
        let value = '';

        for (let i = 0; i < length; i++)
            value += String.fromCharCode( view.getUint8(start + i) );

        return value;
    }

    readExif(view, section_offset) {
        /*
        * La section EXIF commence toujours par Exif00 (sur 6 octets)  
        * 45 78 69 66 00 00
        * E  x  i  f  0  0
        */

        let str = this.stringify(view, section_offset, 4);
        let offset = 6;

        // Not a valid exif
        if ('Exif' !== str) 
            return null;
        
        str = this.stringify(view, section_offset + offset, 2);
        offset += 2;

        // Not a valid exif
        if (-1 === [ 'MM', 'II' ].indexOf(str))
            return null;

        let littleEndian = 'II' === str;
        
        // verification de l'alignement 00 2A pour bigEndian et 2A 00 pour littleEndian
        if (littleEndian && 0x2A00 !== view.getUint16(section_offset + offset))
            return null;

        offset += 2;

        let IFD0_offset = view.getUint32(section_offset + offset, littleEndian);

        let tags = this.readTags(view, section_offset + 6, section_offset + 6 + IFD0_offset, littleEndian, IFD0_TAGS);

        if (tags.GPSInfoIFDPointer) 
        {
            let gps_tags = this.readTags(view, section_offset + 6, section_offset + 6 + tags.GPSInfoIFDPointer, littleEndian, GPS_TAGS);    
            Object.assign(tags, gps_tags);
        }

        if (tags.ExifIFDPointer)
        {
            let exif_ifd_tags = this.readTags(view, section_offset + 6, section_offset + 6 + tags.ExifIFDPointer, littleEndian, EXIF_TAGS);
            Object.assign(tags, exif_ifd_tags);    
        }

        return tags;
    }   

    readTags(view, section_offset, directory_offset, littleEndian, tags) {
         let result = {};

         let offset = directory_offset;

         let entries = view.getUint16(offset, littleEndian);
         let tagsValues = {};
         
         offset += 2;

         while (entries--) {
            let tag = view.getUint16(offset, littleEndian);

            if (tag in tags)
                result[ tags[ tag ][0] ] = this.readTagValue(view, section_offset, offset, littleEndian);
            
            offset += 12;
         }

         return result;
    }

    readTagValue(view, section_offset, tag_offset, littleEndian) {
        let result;

        let format = view.getUint16(tag_offset + 2, littleEndian);
        let count = view.getUint32(tag_offset + 4, littleEndian);
        let valueOffset = section_offset + view.getUint32(tag_offset + 8, littleEndian);
        let i, offset, numerator, denominator;

        switch (format) {
            case 1: // unsigned byte (1) 
                if (1 === count)
                    result = view.getUint8(tag_offset + 8);
                else
                {
                    result = [];

                    offset = count <= 4 ? (tag_offset + 8) : valueOffset;

                    for (i = 0; i < count; i++)
                        result.push(view.getUint8(offset));
                }
            break;
            case 2: // ascii strings (1)
                offset = count <= 4 ? (tag_offset + 8) : valueOffset;
                result = this.stringify(view, offset, count - 1);
            break;
            case 3: // unsigned short (2)
                if (1 === count)
                    result = view.getUint16(tag_offset + 8, littleEndian);
                else
                {
                    result = [];

                    offset = count <= 2 ? (tag_offset + 8) : valueOffset;

                    for (i = 0; i < count; i++)
                        result.push(view.getUint16(offset + 2 * i, littleEndian));
                }
            break;
            case 4: // unsigned long (4)
                if (1 === count)
                    result = view.getUint32(tag_offset + 8, littleEndian);
                else
                {
                    result = [];

                    for (i = 0; i < count; i++)
                        result.push(view.getUint32(valueOffset + 4 * i, littleEndian));
                }
            break;
            case 5: // unsigned rational (8)
                if (1 === count)
                {
                    numerator = view.getUint32(valueOffset, littleEndian);
                    denominator = view.getUint32(valueOffset + 4, littleEndian);

                    result = numerator / denominator;
                }
                else
                {
                    result = [];

                    for (i = 0; i < count; i++)
                    {
                        numerator = view.getUint32(valueOffset + 8 * i, littleEndian);
                        denominator = view.getUint32(valueOffset + 8 * i + 4, littleEndian);
    
                        result.push(numerator / denominator);
                    }
                }
            break;
            case 6: // signed byte (1) NOT SUPPORTED BY EXIF
            break;
            case 7: // undefined (1)
                if (1 === count)
                    result = view.getUint8(tag_offset + 8, littleEndian);
                else
                {
                    result = [];

                    offset = count <= 4 ? (tag_offset + 8) : valueOffset;

                    for (i = 0; i < count; i++)
                        result.push(view.getUint8(offset));
                }
            break;
            case 8: // signed short (2) NOT SUPPORTED BY EXIF
            break;
            case 9: // signed long (4) 
                if (1 === count)
                    result = view.getInt32(tag_offset + 8, littleEndian);
                else
                {
                    result = [];

                    for (i = 0; i < count; i++)
                        result.push(view.getInt32(valueOffset + 4 * i, littleEndian));
                }
            break;
            case 10: // signed rational (8) 
                if (1 === count)
                {
                    numerator = view.getInt32(valueOffset, littleEndian);
                    denominator = view.getInt32(valueOffset + 4, littleEndian);

                    result = numerator / denominator;
                }
                else
                {
                    result = [];

                    for (i = 0; i < count; i++)
                    {
                        numerator = view.getInt32(valueOffset + 8 * i, littleEndian);
                        denominator = view.getInt32(valueOffset + 8 * i + 4, littleEndian);
    
                        result.push(numerator / denominator);
                    }
                }
            break;
            case 11: // single float (4) NOT SUPPORTED BY EXIF
            break;
            case 12: // double float (8) NOT SUPPORTED BY EXIF
            break;
        }

        return result;
    }
}

