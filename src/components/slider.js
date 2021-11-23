import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { Slider } from '@mui/material';

export function TransparencySlider(){
    //const Container = this.

    return(
        
        <div class="bg-gray-400">
            <Box sx={{
                width: 500,
                height: 25,
                border: '1px dashed grey',
            }}>
                <Slider 
                    defaultValue={50} 
                    aria-label="Default" 
                    valueLabelDisplay="auto" 
                    track={false}
                />
            </Box>
        </div>
    );
}