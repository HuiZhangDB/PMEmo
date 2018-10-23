#! usr/bin/env python3
# -*- coding: utf-8 -*-

'''
This features.py is used to extract audio features based on openSIMLE.
Require: openSMILE-2.2rc1
OpenSMILE only support audios in WAV format, 
so before using this script you could
transform MP3s into WAVs by transformat.sh.
'''

__author__ = 'huizhang'

import csv
import os
import shutil
import subprocess
from math import floor
import numpy as np

def extract_all_wav_feature(wavdir, distfile, opensmiledir):
    '''Extract 6373-dimension static features into one dist file.

    Args:
        wavdir: Path to audios in WAV format.
        distfile: Path of distfile.
        opensmiledir: Path to opensimle project root.

    Returns:
        Distfile containing 6373-dimension static features of all the WAVs.
    '''

    SMILExtract = os.path.join(opensmiledir,"SMILExtract")
    config_file = os.path.join(opensmiledir,"config", "IS13_ComParE.conf")

    if os.path.exists(distfile):
        os.remove(distfile)

    wav = [f for f in os.listdir(wavdir) if f[-4:] == ".wav"]
    for w in wav:
        wavpath = os.path.join(wavdir,w)
        subprocess.check_call([SMILExtract, "-C", config_file, "-I", wavpath, "-O", distfile, "-instname", w])

def extract_frame_feature(wavdir, distdir, opensmiledir):
    '''Extract lld features in frame size: 60ms, step size: 10ms.

    Args:
        wavdir: Path to audios in WAV format.
        distdir: Path of distdir.
        opensmiledir: Path to opensimle project root.

    Returns:
        Distfiles containing lld features for each WAV.
    '''

    SMILExtract = os.path.join(opensmiledir,"SMILExtract")
    config_file = os.path.join(opensmiledir,"config", "IS13_ComParE_lld.conf")

    if os.path.exists(distdir):
        shutil.rmtree(distdir)
    os.mkdir(distdir)

    wav = [f for f in os.listdir(wavdir) if f[-4:] == ".wav"]
    for w in wav:
        wavpath = os.path.join(wavdir,w)
        distfile = os.path.join(distdir,w[:-4]+".csv")
        subprocess.check_call([SMILExtract, "-C", config_file, "-I", wavpath, "-O", distfile])


def process_dynamic_feature(llddir, distdir, all_songs_distfile, delimiter=";"):
    '''Obtain dynamic features in window size: 1s, shift size: 0.5s.

    Args:
        llddir: Path to lld feature files.
        distdir: Path of distdir.
        all_songs_distfile: Path of distfile.
        delimiter: csv delimiter in lld feature files, default=';'.

    Returns:
        Distfiles containing 260-dimension dynamic features all WAVs.
    '''

    if os.path.exists(distdir):
        shutil.rmtree(distdir)
    os.mkdir(distdir)

    # names of features
    headers = ['musicId', 'frameTime', 'F0final_sma_mean', 'voicingFinalUnclipped_sma_mean', 'jitterLocal_sma_mean', 'jitterDDP_sma_mean', 'shimmerLocal_sma_mean', 'logHNR_sma_mean', 'audspec_lengthL1norm_sma_mean', 'audspecRasta_lengthL1norm_sma_mean', 'pcm_RMSenergy_sma_mean', 'pcm_zcr_sma_mean', 'audSpec_Rfilt_sma[0]_mean', 'audSpec_Rfilt_sma[1]_mean', 'audSpec_Rfilt_sma[2]_mean', 'audSpec_Rfilt_sma[3]_mean', 'audSpec_Rfilt_sma[4]_mean', 'audSpec_Rfilt_sma[5]_mean', 'audSpec_Rfilt_sma[6]_mean', 'audSpec_Rfilt_sma[7]_mean', 'audSpec_Rfilt_sma[8]_mean', 'audSpec_Rfilt_sma[9]_mean', 'audSpec_Rfilt_sma[10]_mean', 'audSpec_Rfilt_sma[11]_mean', 'audSpec_Rfilt_sma[12]_mean', 'audSpec_Rfilt_sma[13]_mean', 'audSpec_Rfilt_sma[14]_mean', 'audSpec_Rfilt_sma[15]_mean', 'audSpec_Rfilt_sma[16]_mean', 'audSpec_Rfilt_sma[17]_mean', 'audSpec_Rfilt_sma[18]_mean', 'audSpec_Rfilt_sma[19]_mean', 'audSpec_Rfilt_sma[20]_mean', 'audSpec_Rfilt_sma[21]_mean', 'audSpec_Rfilt_sma[22]_mean', 'audSpec_Rfilt_sma[23]_mean', 'audSpec_Rfilt_sma[24]_mean', 'audSpec_Rfilt_sma[25]_mean', 'pcm_fftMag_fband250-650_sma_mean', 'pcm_fftMag_fband1000-4000_sma_mean', 'pcm_fftMag_spectralRollOff25.0_sma_mean', 'pcm_fftMag_spectralRollOff50.0_sma_mean', 'pcm_fftMag_spectralRollOff75.0_sma_mean', 'pcm_fftMag_spectralRollOff90.0_sma_mean', 'pcm_fftMag_spectralFlux_sma_mean', 'pcm_fftMag_spectralCentroid_sma_mean', 'pcm_fftMag_spectralEntropy_sma_mean', 'pcm_fftMag_spectralVariance_sma_mean', 'pcm_fftMag_spectralSkewness_sma_mean', 'pcm_fftMag_spectralKurtosis_sma_mean', 'pcm_fftMag_spectralSlope_sma_mean', 'pcm_fftMag_psySharpness_sma_mean', 'pcm_fftMag_spectralHarmonicity_sma_mean', 'pcm_fftMag_mfcc_sma[1]_mean', 'pcm_fftMag_mfcc_sma[2]_mean', 'pcm_fftMag_mfcc_sma[3]_mean', 'pcm_fftMag_mfcc_sma[4]_mean', 'pcm_fftMag_mfcc_sma[5]_mean', 'pcm_fftMag_mfcc_sma[6]_mean', 'pcm_fftMag_mfcc_sma[7]_mean', 'pcm_fftMag_mfcc_sma[8]_mean', 'pcm_fftMag_mfcc_sma[9]_mean', 'pcm_fftMag_mfcc_sma[10]_mean', 'pcm_fftMag_mfcc_sma[11]_mean', 'pcm_fftMag_mfcc_sma[12]_mean', 'pcm_fftMag_mfcc_sma[13]_mean', 'pcm_fftMag_mfcc_sma[14]_mean', 'F0final_sma_de_mean', 'voicingFinalUnclipped_sma_de_mean', 'jitterLocal_sma_de_mean', 'jitterDDP_sma_de_mean', 'shimmerLocal_sma_de_mean', 'logHNR_sma_de_mean', 'audspec_lengthL1norm_sma_de_mean', 'audspecRasta_lengthL1norm_sma_de_mean', 'pcm_RMSenergy_sma_de_mean', 'pcm_zcr_sma_de_mean', 'audSpec_Rfilt_sma_de[0]_mean', 'audSpec_Rfilt_sma_de[1]_mean', 'audSpec_Rfilt_sma_de[2]_mean', 'audSpec_Rfilt_sma_de[3]_mean', 'audSpec_Rfilt_sma_de[4]_mean', 'audSpec_Rfilt_sma_de[5]_mean', 'audSpec_Rfilt_sma_de[6]_mean', 'audSpec_Rfilt_sma_de[7]_mean', 'audSpec_Rfilt_sma_de[8]_mean', 'audSpec_Rfilt_sma_de[9]_mean', 'audSpec_Rfilt_sma_de[10]_mean', 'audSpec_Rfilt_sma_de[11]_mean', 'audSpec_Rfilt_sma_de[12]_mean', 'audSpec_Rfilt_sma_de[13]_mean', 'audSpec_Rfilt_sma_de[14]_mean', 'audSpec_Rfilt_sma_de[15]_mean', 'audSpec_Rfilt_sma_de[16]_mean', 'audSpec_Rfilt_sma_de[17]_mean', 'audSpec_Rfilt_sma_de[18]_mean', 'audSpec_Rfilt_sma_de[19]_mean', 'audSpec_Rfilt_sma_de[20]_mean', 'audSpec_Rfilt_sma_de[21]_mean', 'audSpec_Rfilt_sma_de[22]_mean', 'audSpec_Rfilt_sma_de[23]_mean', 'audSpec_Rfilt_sma_de[24]_mean', 'audSpec_Rfilt_sma_de[25]_mean', 'pcm_fftMag_fband250-650_sma_de_mean', 'pcm_fftMag_fband1000-4000_sma_de_mean', 'pcm_fftMag_spectralRollOff25.0_sma_de_mean', 'pcm_fftMag_spectralRollOff50.0_sma_de_mean', 'pcm_fftMag_spectralRollOff75.0_sma_de_mean', 'pcm_fftMag_spectralRollOff90.0_sma_de_mean', 'pcm_fftMag_spectralFlux_sma_de_mean', 'pcm_fftMag_spectralCentroid_sma_de_mean', 'pcm_fftMag_spectralEntropy_sma_de_mean', 'pcm_fftMag_spectralVariance_sma_de_mean', 'pcm_fftMag_spectralSkewness_sma_de_mean', 'pcm_fftMag_spectralKurtosis_sma_de_mean', 'pcm_fftMag_spectralSlope_sma_de_mean', 'pcm_fftMag_psySharpness_sma_de_mean', 'pcm_fftMag_spectralHarmonicity_sma_de_mean', 'pcm_fftMag_mfcc_sma_de[1]_mean', 'pcm_fftMag_mfcc_sma_de[2]_mean', 'pcm_fftMag_mfcc_sma_de[3]_mean', 'pcm_fftMag_mfcc_sma_de[4]_mean', 'pcm_fftMag_mfcc_sma_de[5]_mean', 'pcm_fftMag_mfcc_sma_de[6]_mean', 'pcm_fftMag_mfcc_sma_de[7]_mean', 'pcm_fftMag_mfcc_sma_de[8]_mean', 'pcm_fftMag_mfcc_sma_de[9]_mean', 'pcm_fftMag_mfcc_sma_de[10]_mean', 'pcm_fftMag_mfcc_sma_de[11]_mean', 'pcm_fftMag_mfcc_sma_de[12]_mean', 'pcm_fftMag_mfcc_sma_de[13]_mean', 'pcm_fftMag_mfcc_sma_de[14]_mean', 'F0final_sma_std', 'voicingFinalUnclipped_sma_std', 'jitterLocal_sma_std', 'jitterDDP_sma_std', 'shimmerLocal_sma_std', 'logHNR_sma_std', 'audspec_lengthL1norm_sma_std', 'audspecRasta_lengthL1norm_sma_std', 'pcm_RMSenergy_sma_std', 'pcm_zcr_sma_std', 'audSpec_Rfilt_sma[0]_std', 'audSpec_Rfilt_sma[1]_std', 'audSpec_Rfilt_sma[2]_std', 'audSpec_Rfilt_sma[3]_std', 'audSpec_Rfilt_sma[4]_std', 'audSpec_Rfilt_sma[5]_std', 'audSpec_Rfilt_sma[6]_std', 'audSpec_Rfilt_sma[7]_std', 'audSpec_Rfilt_sma[8]_std', 'audSpec_Rfilt_sma[9]_std', 'audSpec_Rfilt_sma[10]_std', 'audSpec_Rfilt_sma[11]_std', 'audSpec_Rfilt_sma[12]_std', 'audSpec_Rfilt_sma[13]_std', 'audSpec_Rfilt_sma[14]_std', 'audSpec_Rfilt_sma[15]_std', 'audSpec_Rfilt_sma[16]_std', 'audSpec_Rfilt_sma[17]_std', 'audSpec_Rfilt_sma[18]_std', 'audSpec_Rfilt_sma[19]_std', 'audSpec_Rfilt_sma[20]_std', 'audSpec_Rfilt_sma[21]_std', 'audSpec_Rfilt_sma[22]_std', 'audSpec_Rfilt_sma[23]_std', 'audSpec_Rfilt_sma[24]_std', 'audSpec_Rfilt_sma[25]_std', 'pcm_fftMag_fband250-650_sma_std', 'pcm_fftMag_fband1000-4000_sma_std', 'pcm_fftMag_spectralRollOff25.0_sma_std', 'pcm_fftMag_spectralRollOff50.0_sma_std', 'pcm_fftMag_spectralRollOff75.0_sma_std', 'pcm_fftMag_spectralRollOff90.0_sma_std', 'pcm_fftMag_spectralFlux_sma_std', 'pcm_fftMag_spectralCentroid_sma_std', 'pcm_fftMag_spectralEntropy_sma_std', 'pcm_fftMag_spectralVariance_sma_std', 'pcm_fftMag_spectralSkewness_sma_std', 'pcm_fftMag_spectralKurtosis_sma_std', 'pcm_fftMag_spectralSlope_sma_std', 'pcm_fftMag_psySharpness_sma_std', 'pcm_fftMag_spectralHarmonicity_sma_std', 'pcm_fftMag_mfcc_sma[1]_std', 'pcm_fftMag_mfcc_sma[2]_std', 'pcm_fftMag_mfcc_sma[3]_std', 'pcm_fftMag_mfcc_sma[4]_std', 'pcm_fftMag_mfcc_sma[5]_std', 'pcm_fftMag_mfcc_sma[6]_std', 'pcm_fftMag_mfcc_sma[7]_std', 'pcm_fftMag_mfcc_sma[8]_std', 'pcm_fftMag_mfcc_sma[9]_std', 'pcm_fftMag_mfcc_sma[10]_std', 'pcm_fftMag_mfcc_sma[11]_std', 'pcm_fftMag_mfcc_sma[12]_std', 'pcm_fftMag_mfcc_sma[13]_std', 'pcm_fftMag_mfcc_sma[14]_std', 'F0final_sma_de_std', 'voicingFinalUnclipped_sma_de_std', 'jitterLocal_sma_de_std', 'jitterDDP_sma_de_std', 'shimmerLocal_sma_de_std', 'logHNR_sma_de_std', 'audspec_lengthL1norm_sma_de_std', 'audspecRasta_lengthL1norm_sma_de_std', 'pcm_RMSenergy_sma_de_std', 'pcm_zcr_sma_de_std', 'audSpec_Rfilt_sma_de[0]_std', 'audSpec_Rfilt_sma_de[1]_std', 'audSpec_Rfilt_sma_de[2]_std', 'audSpec_Rfilt_sma_de[3]_std', 'audSpec_Rfilt_sma_de[4]_std', 'audSpec_Rfilt_sma_de[5]_std', 'audSpec_Rfilt_sma_de[6]_std', 'audSpec_Rfilt_sma_de[7]_std', 'audSpec_Rfilt_sma_de[8]_std', 'audSpec_Rfilt_sma_de[9]_std', 'audSpec_Rfilt_sma_de[10]_std', 'audSpec_Rfilt_sma_de[11]_std', 'audSpec_Rfilt_sma_de[12]_std', 'audSpec_Rfilt_sma_de[13]_std', 'audSpec_Rfilt_sma_de[14]_std', 'audSpec_Rfilt_sma_de[15]_std', 'audSpec_Rfilt_sma_de[16]_std', 'audSpec_Rfilt_sma_de[17]_std', 'audSpec_Rfilt_sma_de[18]_std', 'audSpec_Rfilt_sma_de[19]_std', 'audSpec_Rfilt_sma_de[20]_std', 'audSpec_Rfilt_sma_de[21]_std', 'audSpec_Rfilt_sma_de[22]_std', 'audSpec_Rfilt_sma_de[23]_std', 'audSpec_Rfilt_sma_de[24]_std', 'audSpec_Rfilt_sma_de[25]_std', 'pcm_fftMag_fband250-650_sma_de_std', 'pcm_fftMag_fband1000-4000_sma_de_std', 'pcm_fftMag_spectralRollOff25.0_sma_de_std', 'pcm_fftMag_spectralRollOff50.0_sma_de_std', 'pcm_fftMag_spectralRollOff75.0_sma_de_std', 'pcm_fftMag_spectralRollOff90.0_sma_de_std', 'pcm_fftMag_spectralFlux_sma_de_std', 'pcm_fftMag_spectralCentroid_sma_de_std', 'pcm_fftMag_spectralEntropy_sma_de_std', 'pcm_fftMag_spectralVariance_sma_de_std', 'pcm_fftMag_spectralSkewness_sma_de_std', 'pcm_fftMag_spectralKurtosis_sma_de_std', 'pcm_fftMag_spectralSlope_sma_de_std', 'pcm_fftMag_psySharpness_sma_de_std', 'pcm_fftMag_spectralHarmonicity_sma_de_std', 'pcm_fftMag_mfcc_sma_de[1]_std', 'pcm_fftMag_mfcc_sma_de[2]_std', 'pcm_fftMag_mfcc_sma_de[3]_std', 'pcm_fftMag_mfcc_sma_de[4]_std', 'pcm_fftMag_mfcc_sma_de[5]_std', 'pcm_fftMag_mfcc_sma_de[6]_std', 'pcm_fftMag_mfcc_sma_de[7]_std', 'pcm_fftMag_mfcc_sma_de[8]_std', 'pcm_fftMag_mfcc_sma_de[9]_std', 'pcm_fftMag_mfcc_sma_de[10]_std', 'pcm_fftMag_mfcc_sma_de[11]_std', 'pcm_fftMag_mfcc_sma_de[12]_std', 'pcm_fftMag_mfcc_sma_de[13]_std', 'pcm_fftMag_mfcc_sma_de[14]_std']
    window = 1
    overlap = 0.5

    llds = [f for f in os.listdir(llddir) if f[-4:] == ".csv"]
    all_dynamic_features = []
    all_musicId = []

    for lld in llds:
        musicId = []
        lldpath = os.path.join(llddir,lld)
        single_song_distfile = os.path.join(distdir,lld)

        dynamic_features = _compute_feature_with_window_and_overlap(lldpath, window, overlap, delimiter)
        for i in range(len(dynamic_features)):
            musicId.append(lld[:-4])
        _write_features_to_csv(headers, musicId, dynamic_features, single_song_distfile)

        all_musicId += musicId
        all_dynamic_features += dynamic_features

    _write_features_to_csv(headers, all_musicId, all_dynamic_features, all_songs_distfile)

def _compute_feature_with_window_and_overlap(lldpath, window, overlap, delimiter):
    '''Compute the mean and std for frame-wise features in window size: 1s, shift size: 0.5s.'''

    fs = 0.01
    num_in_new_frame = floor(overlap/fs)
    num_in_window = floor(window/fs)

    # load the features from disk
    all_frame = []
    with open(lldpath) as f:
        reader = csv.reader(f,delimiter=delimiter)
        next(reader)
        for row in reader:
            frame_feature = []
            for i in range(len(row)-1): #旧的frametime不用记录
                frame_feature.append(float(row[i+1]))
            all_frame.append(frame_feature)

    # compute new number of frames
    new_num_of_frame = floor(len(all_frame)/num_in_new_frame)
    all_new_frame = []

    # compute mean and std in each window as the feature corresponding to the frame. 
    for i in range(new_num_of_frame):
        start_index = num_in_new_frame * i
        new_frame_array = np.array(all_frame[start_index:start_index+num_in_window])

        mean_llds = np.mean(new_frame_array,axis=0)
        std_llds = np.std(new_frame_array,axis=0)
        new_frametime = i * overlap

        new_frame = [new_frametime] + mean_llds.tolist() + std_llds.tolist()
        all_new_frame.append(new_frame)

    return all_new_frame

def _write_features_to_csv(headers, musicIds, contents, distfile):
    '''Write all the features into one file, and add the last column as the annotation value'''
    
    with open(distfile,"w") as newfile:
        writer = csv.writer(newfile)
        writer.writerow(headers + ["class"])
        for i in range(len(contents)):
            writer.writerow([musicIds[i]] + contents[i] + ["?"])


if __name__ == "__main__":
    wavdir ="/Path/to/WAVs"
    opensmiledir = "/Path/to/openSMILE-2.1.0"

    static_distfile = "static_features.arff"
    lld_distdir = "IS13features_lld"
    dynamic_distdir = "dynamic_features"
    all_dynamic_distfile = "dynamic_features.csv"

    delimiter = ";"

    extract_all_wav_feature(wavdir,static_distfile,opensmiledir)
    extract_frame_feature(wavdir,lld_distdir,opensmiledir)
    process_dynamic_feature(lld_distdir,dynamic_distdir,all_dynamic_distfile,delimiter)

