export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFile: (file: File) => void,
  setPreview: (preview: string) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
