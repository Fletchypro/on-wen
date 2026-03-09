import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MessageInput = ({ newMessage, setNewMessage, imagePreview, setImagePreview, setImageFile, isSending, handleSendMessage }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImagePreview = () => {
        setImagePreview(null);
        setImageFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <footer className="p-3 md:p-4 border-t border-white/10 bg-black/20 backdrop-blur-md flex-shrink-0">
            <AnimatePresence>
                {imagePreview && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2 relative w-24 h-24"
                    >
                        <img src={imagePreview} alt="Preview" className="rounded-lg object-cover w-full h-full" />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeImagePreview}
                        >
                            <X size={16} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                 <Button type="button" size="icon" variant="ghost" className="text-white/70 hover:text-white" onClick={() => fileInputRef.current.click()}>
                    <ImageIcon size={20} />
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full p-3 rounded-full bg-black/20 backdrop-blur-sm border-2 border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Button type="submit" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 flex-shrink-0" disabled={isSending}>
                    <Send size={20} />
                </Button>
            </form>
        </footer>
    );
};

export default MessageInput;