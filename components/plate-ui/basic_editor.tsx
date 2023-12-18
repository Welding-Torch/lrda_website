import { Plate } from '@udecode/plate-common';
import { Editor } from './editor';

export default function BasicEditor() {
  return (
    <Plate>
      <Editor placeholder="Start typing..." />
    </Plate>
  );
}
