import React, { useState } from 'react';
import { Galleria } from 'primereact/galleria';

function RoomDetailGallery({ images }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const itemTemplate = (item) => {
        return <img src={item} alt="Room Thumbnail" style={{ width: '100%', maxHeight: '400px' }} />;
    };

    const thumbnailTemplate = (item) => {
        return <img src={item} alt="Room Thumbnail" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />;
    };

    return (
        <div>
            <Galleria
                value={images}
                activeIndex={activeIndex}
                onItemChange={(e) => setActiveIndex(e.index)}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
                circular
                showItemNavigators
                showThumbnails
                thumbnailsPosition="bottom"
                className="custom-galleria"
                style={{ maxWidth: '800px', margin: 'auto' }}
            />
        </div>
    );
}

export default RoomDetailGallery;
