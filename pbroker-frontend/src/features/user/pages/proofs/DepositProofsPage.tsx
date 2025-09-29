import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepositProofsService, addDepositProofsService, downloadDepositProofService, deleteDepositProofService } from '../../services/transactionService';
import {  ArrowLeft, Download, Trash2 } from 'lucide-react';

const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);

const DepositProofsPage: React.FC = () => {
  const { depositId } = useParams<{ depositId: string }>();
  const navigate = useNavigate();
  const [proofFiles, setProofFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ filename: string; open: boolean } | null>(null);

  useEffect(() => {
    if (depositId) {
      setIsLoading(true);
      getDepositProofsService(depositId)
        .then(setProofFiles)
        .catch(() => setProofFiles([]))
        .finally(() => setIsLoading(false));
    }
  }, [depositId]);

  const handleAddProofs = async (files: FileList | null) => {
    if (!files || !depositId) return;
    setIsUploading(true);
    try {
      await addDepositProofsService(depositId, Array.from(files));
      const updated = await getDepositProofsService(depositId);
      setProofFiles(updated);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadProof = async (filenameOrUrl: string) => {
    if (!depositId) return;
    setDownloadingFile(filenameOrUrl);
    try {
      const blob = await downloadDepositProofService(depositId, filenameOrUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenameOrUrl;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDeleteProof = async (filenameOrUrl: string) => {
    if (!depositId) return;
    setDeletingFile(filenameOrUrl);
    try {
      await deleteDepositProofService(depositId, filenameOrUrl);
      setProofFiles(files => files.filter((file: any) => (file.filename || file.url || file) !== filenameOrUrl));
    } finally {
      setDeletingFile(null);
      setShowDeleteConfirm(null);
    }
  };

  // Helper to get filename and url from proof object or string
  const getFileInfo = (file: any) => {
    if (typeof file === 'string') return { filename: file, url: undefined };
    return { filename: file.filename || file.url, url: file.url };
  };

  return (
    <div className="container mx-auto max-w-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-xs font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-lg font-bold text-center flex-1">Deposit Proofs</h2>
        <span className="w-8" />
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 relative">
        {(isUploading || downloadingFile) && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <span className="text-xs text-blue-700 font-medium">
                {isUploading ? 'Uploading...' : `Downloading ${downloadingFile}`}
              </span>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[100px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              {proofFiles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <div className="text-xs text-gray-500">No proofs uploaded.</div>
                  <label className="block text-xs font-medium mb-1 mt-2">Add Proof</label>
                  {proofFiles.filter((file: any) => {
                    const { filename } = typeof file === 'string' ? { filename: file } : file;
                    return isImage(filename);
                  }).length < 3 && (
                    <label className="inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition mb-2">
                      Browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploading}
                        onChange={e => handleAddProofs(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {proofFiles.map((file: any) => {
                    const { filename, url } = getFileInfo(file);
                    const imageUrl = url || (filename ? `/api/deposits/${depositId}/proofs/${filename}` : undefined);
                    return (
                      <div key={filename} className="relative flex flex-col items-center bg-gray-50 rounded-lg border border-gray-200 p-3">
                        {isImage(filename) && imageUrl ? (
                          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={imageUrl}
                              alt={filename}
                              className="h-40 w-auto object-contain rounded mb-2 border bg-white"
                              onError={e => (e.currentTarget.style.display = 'none')}
                            />
                          </a>
                        ) : (
                          <div className="h-40 w-full flex items-center justify-center bg-gray-100 rounded mb-2 text-xs text-gray-400">
                            {filename}
                          </div>
                        )}
                        <span className="truncate text-xs mb-2 w-full text-center">{filename}</span>
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                            onClick={() => handleDownloadProof(filename)}
                            disabled={!!downloadingFile}
                          >
                            <Download className="h-4 w-4" /> Download
                          </button>
                          <button
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                            onClick={() => setShowDeleteConfirm({ filename, open: true })}
                            disabled={!!deletingFile}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                        {/* Delete confirmation modal */}
                        {showDeleteConfirm && showDeleteConfirm.filename === filename && showDeleteConfirm.open && (
                          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full flex flex-col items-center">
                              <div className="text-red-600 font-bold mb-2">Warning</div>
                              <div className="text-xs text-gray-700 mb-4 text-center">
                                Are you sure you want to delete this proof file?
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => setShowDeleteConfirm(null)}
                                  disabled={!!deletingFile}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleDeleteProof(filename)}
                                  disabled={!!deletingFile}
                                >
                                  {deletingFile ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {proofFiles.length > 0 && (
              <div className="mt-6">
                {proofFiles.filter((file: any) => {
                  const { filename } = typeof file === 'string' ? { filename: file } : file;
                  return isImage(filename);
                }).length < 3 && (
                  <>
                    <label className="block text-xs font-medium mb-1">Add More Proofs</label>
                    <label className="inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition mb-2">
                      Browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploading}
                        onChange={e => handleAddProofs(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepositProofsPage; 