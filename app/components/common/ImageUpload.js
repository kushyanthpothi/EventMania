'use client';

import { useState, useRef } from 'react';
import { IoCloudUpload, IoClose, IoImage } from 'react-icons/io5';
import { uploadImage } from '../../lib/imgbb/upload';
import { validateImageFile } from '../../lib/utils/validators';
import { showToast } from './Toast';
import { Loader } from './Loader';

export const ImageUpload = ({
    label,
    onUploadComplete,
    onFileSelect,
    currentImage = null,
    required = false,
    className = '',
    uploadImmediately = false // New prop to control upload behavior
}) => {
    const [preview, setPreview] = useState(currentImage);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            showToast.error(validation.error);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        if (uploadImmediately) {
            // Old behavior: Upload immediately
            setUploading(true);
            const { url, error } = await uploadImage(file);
            setUploading(false);

            if (error) {
                showToast.error(`Upload failed: ${error}`);
                setPreview(currentImage);
            } else {
                showToast.success('Image uploaded successfully!');
                onUploadComplete(url);
            }
        } else {
            // New behavior: Just store the file and show preview
            setSelectedFile(file);
            if (onFileSelect) {
                onFileSelect(file);
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setSelectedFile(null);
        if (onUploadComplete) {
            onUploadComplete(null);
        }
        if (onFileSelect) {
            onFileSelect(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {preview ? (
                    <div
                        className="relative group rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#e5e7eb', minHeight: '256px' }}
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '256px',
                                objectFit: 'cover'
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>
                        {uploading && (
                            <div
                                className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
                            >
                                <Loader size="lg" />
                            </div>
                        )}
                    </div>
                ) : (
                    <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 border-theme hover:border-indigo-500"
                        style={{ backgroundColor: 'rgb(var(--surface))' }}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <Loader size="lg" />
                            ) : (
                                <>
                                    <IoCloudUpload className="text-theme-secondary mb-3" size={48} />
                                    <p className="mb-2 text-sm text-theme-secondary">
                                        <span className="font-semibold text-indigo-500">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-theme-secondary">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
};

