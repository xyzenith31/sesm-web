import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload, FiLoader, FiSave, FiPlus, FiTrash2, FiLink } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

const StoryNodeEditor = ({ node, index, allNodeIds, onUpdate, onRemove }) => {
    const handleInputChange = (field, value) => onUpdate(index, { ...node, [field]: value });
    const handleChoiceTextChange = (choiceIndex, text) => {
        const newChoices = [...node.choices];
        newChoices[choiceIndex].text = text;
        onUpdate(index, { ...node, choices: newChoices });
    };
    const handleChoiceLinkChange = (choiceIndex, leadsTo) => {
        const newChoices = [...node.choices];
        newChoices[choiceIndex].leadsTo = leadsTo;
        onUpdate(index, { ...node, choices: newChoices });
    };
    const addChoice = () => onUpdate(index, { ...node, choices: [...node.choices, { text: '', leadsTo: '' }] });
    const removeChoice = (choiceIndex) => onUpdate(index, { ...node, choices: node.choices.filter((_, i) => i !== choiceIndex) });
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpdate(index, { ...node, imageFile: file, image: URL.createObjectURL(file) });
        }
    };

    const nodeIdOptions = allNodeIds.map(id => ({ value: id, label: `Ke node: ${id}` }));
    const API_URL = 'http://localhost:8080';

    return (
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-sesm-teal space-y-3">
            <div className="flex justify-between items-center">
                <input type="text" value={node.id} onChange={(e) => handleInputChange('id', e.target.value.replace(/\s+/g, '_'))} className="font-bold text-lg text-sesm-deep bg-transparent focus:outline-none focus:ring-1 focus:ring-sesm-teal rounded px-2 py-1" placeholder="Nama_Node_Unik" />
                {index > 0 && <button type="button" onClick={() => onRemove(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FiTrash2 size={16}/></button>}
            </div>
            
            <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-white relative">
                <input type="file" id={`node-img-${index}`} className="hidden" onChange={handleImageChange} accept="image/*" />
                <label htmlFor={`node-img-${index}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center">
                    {node.image ? <img src={node.image.startsWith('blob:') ? node.image : `${API_URL}/${node.image}`} alt="preview" className="w-full h-full object-cover rounded-md"/> : <><FiUpload size={30} className="text-gray-400"/><p className="text-sm text-gray-500">Pilih Gambar Node</p></>}
                </label>
            </div>

            <textarea value={node.text} onChange={(e) => handleInputChange('text', e.target.value)} placeholder="Tuliskan bagian cerita untuk node ini..." className="w-full p-2 border rounded-md h-28" required />
            
            {!node.isEnding && (
                <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold">Pilihan Jawaban:</h4>
                    {node.choices.map((choice, cIndex) => (
                        <div key={cIndex} className="flex items-center gap-2 bg-white p-2 rounded-md border">
                            <input type="text" value={choice.text} onChange={(e) => handleChoiceTextChange(cIndex, e.target.value)} placeholder={`Teks Pilihan ${cIndex + 1}`} className="w-1/2 p-1 border-b focus:outline-none"/>
                            <div className="w-1/2">
                                <CustomSelect options={nodeIdOptions} value={choice.leadsTo} onChange={(val) => handleChoiceLinkChange(cIndex, val)} placeholder="Pilih Tujuan..."/>
                            </div>
                            <button type="button" onClick={() => removeChoice(cIndex)} className="p-1 text-gray-400 hover:text-red-600"><FiTrash2 size={14}/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addChoice} className="text-sm font-semibold text-sesm-deep flex items-center gap-1"><FiPlus size={14}/> Tambah Pilihan</button>
                </div>
            )}
            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id={`is-ending-${index}`} checked={node.isEnding} onChange={(e) => handleInputChange('isEnding', e.target.checked)}/>
                <label htmlFor={`is-ending-${index}`} className="text-sm font-semibold text-gray-700">Jadikan Akhir Cerita</label>
            </div>
        </div>
    );
};


const StoryEditorModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = Boolean(initialData);
    const API_URL = 'http://localhost:8080';
    const [formData, setFormData] = useState({ title: '', synopsis: '', category: '', read_time: '', total_endings: '' });
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [nodes, setNodes] = useState([]);

    const getNewNode = () => ({ id: `node_${Date.now()}`, image: '', imageFile: null, text: '', choices: [{ text: '', leadsTo: '' }], isEnding: false });
    
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    title: initialData.title || '', synopsis: initialData.synopsis || '', category: initialData.category || '',
                    read_time: initialData.read_time || '', total_endings: initialData.total_endings || '',
                });
                
                if (initialData.cover_image) {
                    setPreview(`${API_URL}/${initialData.cover_image}`);
                } else {
                    setPreview('');
                }

                let storyDataObj = null;
                if (initialData.story_data) {
                    try {
                        storyDataObj = typeof initialData.story_data === 'string' 
                            ? JSON.parse(initialData.story_data) 
                            : initialData.story_data;
                    } catch (e) {
                        console.error("Failed to parse story_data JSON:", e);
                        storyDataObj = null;
                    }
                }

                if (storyDataObj && typeof storyDataObj === 'object') {
                    const nodesArray = Object.keys(storyDataObj).map(key => ({
                        id: key,
                        image: storyDataObj[key].image || '',
                        imageFile: null,
                        text: storyDataObj[key].text || '',
                        choices: storyDataObj[key].choices || [],
                        isEnding: storyDataObj[key].ending || false,
                    }));
                    setNodes(nodesArray.length > 0 ? nodesArray : [getNewNode()]);
                } else {
                    setNodes([ { id: 'start', image: '', imageFile: null, text: '', choices: [], isEnding: false } ]);
                }
            } else {
                setFormData({ title: '', synopsis: '', category: '', read_time: '', total_endings: '' });
                setNodes([ { id: 'start', image: '', imageFile: null, text: '', choices: [], isEnding: false } ]);
                setPreview('');
                setCoverImage(null);
            }
        }
    }, [isOpen, initialData, isEditMode]);

    const allNodeIds = useMemo(() => nodes.map(n => n.id), [nodes]);

    const handleUpdateNode = (index, updatedNode) => setNodes(prev => prev.map((n, i) => i === index ? updatedNode : n));
    const handleAddNode = () => setNodes(prev => [...prev, getNewNode()]);
    const handleRemoveNode = (index) => setNodes(prev => prev.filter((_, i) => i !== index));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const storyDataObject = {};
        nodes.forEach(node => {
            storyDataObject[node.id] = {
                image: node.imageFile ? node.id : node.image,
                text: node.text,
                choices: node.isEnding ? [] : node.choices,
                ending: node.isEnding
            };
        });

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('story_data', JSON.stringify(storyDataObject));
        if (coverImage) data.append('cover_image', coverImage);
        
        nodes.forEach(node => {
            if (node.imageFile) {
                data.append('node_images', node.imageFile, node.id);
            }
        });
        
        try {
            await onSubmit(data, initialData?.id);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-5xl shadow-xl flex flex-col h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-sesm-deep">{isEditMode ? 'Edit Cerita' : 'Buat Cerita Baru'}</h3><button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX/></button></header>
                    
                    {/* [PERBAIKAN] Mengubah layout <main> */}
                    <main className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
                        {/* Kolom Kiri (Detail Cerita) */}
                        <div className="p-6 border-r border-gray-200 overflow-y-auto">
                            <div className="space-y-4">
                                <div><label className="font-semibold text-sm">Judul Cerita</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required /></div>
                                <div><label className="font-semibold text-sm">Sinopsis</label><textarea value={formData.synopsis} onChange={e => setFormData({...formData, synopsis: e.target.value})} className={`${inputStyle} h-28`} required /></div>
                                <div><label className="font-semibold text-sm">Gambar Sampul</label><div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center"><input type="file" id="story-cover" className="hidden" onChange={handleImageChange} accept="image/*"/><label htmlFor="story-cover" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center">{preview ? <img src={preview} alt="Preview" className="h-24 rounded-md mb-2 object-cover"/> : <FiUpload size={32} className="mb-2 text-gray-400"/>}{coverImage ? coverImage.name : "Pilih gambar..."}</label></div></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="font-semibold text-sm">Kategori</label><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle} placeholder="Cth: Fabel"/></div>
                                    <div><label className="font-semibold text-sm">Waktu Baca (Menit)</label><input type="number" value={formData.read_time} onChange={e => setFormData({...formData, read_time: e.target.value})} className={inputStyle} placeholder="Cth: 5"/></div>
                                </div>
                                <div><label className="font-semibold text-sm">Jumlah Akhir Cerita</label><input type="number" value={formData.total_endings} onChange={e => setFormData({...formData, total_endings: e.target.value})} className={inputStyle} placeholder="Cth: 4"/></div>
                            </div>
                        </div>

                        {/* Kolom Kanan (Editor Node) dengan Scroll */}
                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-4">
                                {nodes.map((node, index) => (
                                    <StoryNodeEditor key={index} node={node} index={index} allNodeIds={allNodeIds} onUpdate={handleUpdateNode} onRemove={handleRemoveNode}/>
                                ))}
                                <button type="button" onClick={handleAddNode} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg text-sesm-deep hover:bg-sesm-teal/10"><FiPlus/> Tambah Node Cerita</button>
                            </div>
                        </div>
                    </main>

                    <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t"><button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button><button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400">{isSubmitting ? <FiLoader className="animate-spin"/> : <FiSave/>}{isSubmitting ? 'Menyimpan...' : 'Simpan Cerita'}</button></footer>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default StoryEditorModal;